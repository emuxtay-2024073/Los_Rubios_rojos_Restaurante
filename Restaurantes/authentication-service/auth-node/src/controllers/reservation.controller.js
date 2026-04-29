import Reservation from "../models/Reservation.js";
import Restaurant from "../models/Restaurant.js";
import Table from "../models/Table.js";

export const createReservation = async (req, res) => {
    try {
        const {
            customerName,
            reservationDate,
            restaurant,
            table
        } = req.body;

        if (!customerName || !reservationDate || !restaurant || !table) {
            return res.status(400).json({
                message: "Nombre, fecha, restaurante y mesa son obligatorios"
            });
        }

        const existingRestaurant = await Restaurant.findById(restaurant);
        if (!existingRestaurant) {
            return res.status(404).json({
                message: "El restaurante no existe"
            });
        }

        const existingTable = await Table.findById(table);
        if (!existingTable || existingTable.restaurant.toString() !== restaurant) {
            return res.status(404).json({
                message: "La mesa no existe o no pertenece al restaurante"
            });
        }

        if (existingTable.status === "no disponible") {
            return res.status(400).json({
                message: "La mesa no está disponible"
            });
        }

        const reservation = await Reservation.create({
            ...req.body,
            reservationDate: new Date(reservationDate)
        });

        // Cambiar status de la mesa a no disponible
        await Table.findByIdAndUpdate(table, { status: "no disponible" });

        res.status(201).json(reservation);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getReservations = async (req, res) => {
    const reservations = await Reservation.find({ isDeleted: false })
        .populate({
            path: "restaurant",
            match: { isDeleted: false }
        })
        .populate("table");

    res.json(reservations);
};

export const deleteReservation = async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
        return res.status(404).json({ message: "Reserva no encontrada" });
    }

    // Cambiar status de la mesa a disponible
    await Table.findByIdAndUpdate(reservation.table, { status: "disponible" });

    await Reservation.findByIdAndUpdate(req.params.id, {
        isDeleted: true
    });

    res.json({ message: "Reserva eliminada (soft delete)" });
};

