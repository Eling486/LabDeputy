const equipment = {
    getAvailableEquipment: async () => {
        return await global.db.equipment.get(1)
    }
}

module.exports = equipment;