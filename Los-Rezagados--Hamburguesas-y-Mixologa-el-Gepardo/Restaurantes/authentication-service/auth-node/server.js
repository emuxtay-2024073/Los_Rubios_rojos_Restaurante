import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";


dotenv.config();

const app = express();
app.use(express.json());


// ================== MONGODB ==================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB conectado"))
    .catch(err => console.error(err));

// ================== MODELOS ==================
const Role = mongoose.model("Role", new mongoose.Schema({
    name: { type: String, required: true, unique: true, uppercase: true },
    permissions: [String]
}, { timestamps: true }));

const User = mongoose.model("User", new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }
}, { timestamps: true }));

const Restaurant = mongoose.model("Restaurant", new mongoose.Schema({
    name: { type: String, required: true },
    address: String
}, { timestamps: true }));

const MenuItem = mongoose.model("MenuItem", new mongoose.Schema({
    name: String,
    price: Number,
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }
}));

const Table = mongoose.model("Table", new mongoose.Schema({
    number: { type: Number, unique: true },
    capacity: Number,
    status: { type: String, default: "disponible" }
}));

const Order = mongoose.model("Order", new mongoose.Schema({
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    items: [
        {
            menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
            quantity: Number,
            price: Number
        }
    ],
    total: Number,
    status: { type: String, default: "pendiente" }
}, { timestamps: true }));

// ================== SWAGGER ==================
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Restaurante",
            version: "1.0.0",
            description: "API completa para gestión de restaurante"
        },
        servers: [
            { url: "http://localhost:3000" }
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
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
                        password: { type: "string" },
                        role: { type: "string" }
                    }
                },
                Restaurant: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        address: { type: "string" }
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
                }
            }
        }
    },

    // 🔥 IMPORTANTE: ahora lee tus routes también
    apis: ["./server.js", "./src/routes/*.js"]
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// ================== RUTAS ==================

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 */
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "secreto",
            { expiresIn: "2h" }
        );

        res.json({ token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================== SERVER ==================
app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
});