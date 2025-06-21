const booking = {
    getBookingByPeriod: async (equipment_id = null, from, to, status = 0) => {
        return await global.db.booking.get(equipment_id, from, to, status)
    }
}

module.exports = booking;