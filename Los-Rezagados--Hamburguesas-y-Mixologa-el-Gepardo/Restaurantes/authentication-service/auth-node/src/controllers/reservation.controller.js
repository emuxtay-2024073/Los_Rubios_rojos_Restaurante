import Reservation from "../models/Reservation.js";
import Restaurant from "../models/Restaurant.js";

export const createReservation = async (req, res) => {
    try {
        const {
            customerName,
            reservationDate,
            restaurant
        } = req.body;

        if (!customerName || !reservationDate || !restaurant) {
            return res.status(400).json({
                message: "Nombre, fecha y restaurante son obligatorios"
            });
        }

        const existingRestaurant = await Restaurant.findById(restaurant);
        if (!existingRestaurant) {
            return res.status(404).json({
                message: "El restaurante no existe"
            });
        }

        const reservation = await Reservation.create({
            ...req.body,
            reservationDate: new Date(reservationDate)
        });

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
        });

    res.json(reservations);
};

export const deleteReservation = async (req, res) => {
    await Reservation.findByIdAndUpdate(req.params.id, {
        isDeleted: true
    });

    res.json({ message: "Reserva eliminada (soft delete)" });
};

