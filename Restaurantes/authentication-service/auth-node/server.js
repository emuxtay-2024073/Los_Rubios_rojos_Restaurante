import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import restaurantRoutes from "./src/routes/restaurant.routes.js";
import menuItemRoutes from "./src/routes/menuItem.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import roleRoutes from "./src/routes/role.routes.js";
import tableRoutes from "./src/routes/table.routes.js";

// Importar modelos
import Restaurant from "./src/models/Restaurant.js";
import MenuItem from "./src/models/MenuItem.js";
import Order from "./src/models/Order.js";
import Table from "./src/models/Table.js";
import Reservation from "./src/models/Reservation.js";
import Review from "./src/models/Review.js";


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error("Error: MONGO_URI no está definido. Crea un archivo .env con la variable MONGO_URI de tu conexión MongoDB.");
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log("MongoDB conectado"))
    .catch(err => console.error(err));

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
let server = app.listen(PORT, () => {
    console.log("Servidor en http://localhost:" + PORT);
    console.log("Swagger UI disponible en: http://localhost:" + PORT + "/api-docs");
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
    });
});