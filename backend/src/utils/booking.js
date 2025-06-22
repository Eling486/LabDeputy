const booking = {
    getBookingByPeriod: async (from, to, equipment_id = null, status = 0) => {
        return await global.db.booking.get(equipment_id, from, to, status)
    },
    addBooking: async (data) => {
        return await global.db.booking.add(data)
    }
}

module.exports = booking;