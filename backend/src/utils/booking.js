const booking = {
    getBookingByPeriod: async (from, to, equipment_id = null, status = 0) => {
        return await global.db.booking.get(equipment_id, from, to, status)
    },
    getBookingByBookingId: async (booking_id) => {
        return await global.db.booking.getByBookingId(booking_id)
    },
    addBooking: async (data) => {
        return await global.db.booking.add(data)
    },
    cancelBooking: async (booking_id) => {
        return await global.db.booking.updateStatus(booking_id, -1)
    }
}

module.exports = booking;