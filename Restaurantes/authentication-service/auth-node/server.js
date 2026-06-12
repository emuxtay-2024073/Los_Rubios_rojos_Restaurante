import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

// ADVERTENCIA: solo para desarrollo local si tu red (proxy/antivirus) intercepta TLS
// y causa "unable to verify the first certificate" al subir imágenes a Cloudinary.
// NUNCA usar en producción.
if (process.env.NODE_ENV !== "production" && process.env.DEV_DISABLE_TLS_VERIFY === "true") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}


import restaurantRoutes from "./src/routes/restaurant.routes.js";
import menuItemRoutes from "./src/routes/menuItem.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import roleRoutes from "./src/routes/role.routes.js";
import tableRoutes from "./src/routes/table.routes.js";
import reservationRoutes from "./src/routes/reservation.routes.js";

// Importar modelos
import Restaurant from "./src/models/Restaurant.js";
import MenuItem from "./src/models/MenuItem.js";
import Order from "./src/models/Order.js";
import Table from "./src/models/Table.js";
import Reservation from "./src/models/Reservation.js";
import Review from "./src/models/Review.js";
import User from "./src/models/User.js";
import Role from "./src/models/Role.js";


dotenv.config();

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "100kb" }));

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origen no permitido por CORS"));
    },
    credentials: true
}));

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error("Error: MONGO_URI no está definido. Crea un archivo .env con la variable MONGO_URI de tu conexión MongoDB.");
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(async () => {
        console.log("MongoDB conectado");
        await seedDefaultAdmin();
    })
    .catch(err => console.error(err));

const seedDefaultAdmin = async () => {
    try {
        const defaultAdminUsername = process.env.SEED_ADMIN_USERNAME || "adminrestaurante";
        const defaultAdminEmail = (process.env.SEED_ADMIN_EMAIL || "adminrestaurante@losrezagados.com").toLowerCase().trim();
        const defaultAdminPassword = process.env.SEED_ADMIN_PASSWORD;
        const defaultRoleName = process.env.SEED_ADMIN_ROLE || "ADMIN";

        if (!defaultAdminPassword) {
            console.warn("[Seed] SEED_ADMIN_PASSWORD no definido. No se creara ni actualizara el admin predeterminado.");
            return;
        }

        const role = await Role.findOneAndUpdate(
            { name: defaultRoleName },
            { name: defaultRoleName },
            { new: true, upsert: true }
        );

        let admin = await User.findOne({ email: defaultAdminEmail });
        if (!admin) {
            admin = new User({
                username: defaultAdminUsername,
                email: defaultAdminEmail,
                password: defaultAdminPassword,
                role: role._id,
                verified: true,
                verificationToken: null,
                verificationTokenExpires: null,
                loginAttempts: 0,
                lockUntil: null
            });
            await admin.save();
            console.log(`[Seed] Admin predeterminado creado: ${defaultAdminEmail}`);
            return;
        }

        const isAdminRole = admin.role?.toString() === role._id.toString();
        if (!isAdminRole) {
            admin.role = role._id;
        }

        if (!admin.verified) {
            admin.verified = true;
            admin.verificationToken = null;
            admin.verificationTokenExpires = null;
        }

        const passwordMatches = await admin.comparePassword(defaultAdminPassword);
        if (!passwordMatches) {
            admin.password = defaultAdminPassword;
        }

        await admin.save();
        console.log(`[Seed] Admin predeterminado actualizado: ${defaultAdminEmail}`);
    } catch (error) {
        console.error("Error al sembrar admin predeterminado:", error);
    }
};

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Restaurante",
            version: "1.0.0",
            description: "API completa para gestión de restaurante"
        },
        servers: [
            { url: "http://localhost:3000", description: "Node.js API" },
            { url: "http://localhost:5022", description: ".NET API" }
        ],
        security: [
            {
                bearerAuth: []
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },

            schemas: {
                    Restaurant: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        address: { type: "string" },
                        phone: { type: "string" },
                        city: { type: "string" }
                    }
                },
                MenuItem: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        price: { type: "number" },
                        restaurant: { type: "string" }
                    }
                },
                Order: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        table: { type: "string" },
                        items: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    menuItem: { type: "string" },
                                    quantity: { type: "number" },
                                    price: { type: "number" }
                                }
                            }
                        },
                        total: { type: "number" },
                        status: { type: "string" }
                    }
                },
                Table: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        number: { type: "number" },
                        capacity: { type: "number" },
                        restaurant: { type: "string" },
                        status: { 
                            type: "string", 
                            enum: ["disponible", "no disponible"] 
                        }
                    }
                },
                Reservation: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        customerName: { type: "string" },
                        customerPhone: { type: "string" },
                        customerEmail: { type: "string" },
                        reservationDate: { type: "string", format: "date-time" },
                        numberOfGuests: { type: "number" },
                        restaurant: { type: "string" },
                        table: { type: "string" },
                        isDeleted: { type: "boolean" }
                    }
                },
                    Review: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        restaurant: { type: "string" },
                        rating: { type: "number" },
                        comment: { type: "string" }
                    }
                },
                AuthResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        token: { type: "string", nullable: true }
                    }
                }
            }
        }
    },

    apis: ["./server.js", "./src/routes/restaurant.routes.js", "./src/routes/menuItem.routes.js", "./src/routes/order.routes.js"]
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


app.use("/restaurants", restaurantRoutes);
app.use("/menu-items", menuItemRoutes);
app.use("/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/tables", tableRoutes);
app.use("/api/reservations", reservationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Error interno del servidor", error: err.message });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Excepción no capturada:', error);
    process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Rechazo no manejado en:', promise, 'razón:', reason);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log("Servidor en http://localhost:" + PORT);
    console.log("Swagger UI disponible en: http://localhost:" + PORT + "/api-docs");
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} ya está en uso. Cierra el proceso existente o cambia PORT en .env.`);
        process.exit(1);
    }
    console.error('Error de servidor:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
    });
});
 