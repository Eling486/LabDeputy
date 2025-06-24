const sqlite = require('./sqlite')
const moment = require("moment");

class db {

    constructor() {
        this.sqlite = new sqlite()
        this.db = this.sqlite.db
        this.user = {
            getByUsername: async (username) => {
                return await this.search(`SELECT * FROM user WHERE username = ?`, [username])
            },
            getByUid: async (uid) => {
                return await this.search(`SELECT * FROM user WHERE uid = ?`, [uid])
            },
            updatePasswordByUid: async (uid, password) => {
                let err = await this.runSync(`UPDATE user SET password=? WHERE uid = ?;`, [password, uid])
                if (err) {
                    global.logger.error(err)
                    return -1
                };
                return 0
            },
            updateRealnameByUid: async (uid, realname) => {
                let err = await this.runSync(`UPDATE user SET realname=? WHERE uid = ?;`, [realname, uid])
                if (err) {
                    global.logger.error(err)
                    return -1
                };
                return 0
            },
            addInvitation: async (invitation) => {
                let err = await this.runSync(`INSERT INTO user (invitation) VALUES (?);`, [invitation])
                if (err) return -1;
                return 0
            },
            getByInvitation: async (invitation) => {
                return await this.search(`SELECT * FROM user WHERE invitation = ? AND username IS NULL;`, [invitation])
            },
            updateAllByUid: async (uid, username, password, realname) => {
                let err = await this.runSync(`UPDATE user SET username=?, password=?, realname=? WHERE uid = ?;`, [username, password, realname, uid])
                if (err) {
                    global.logger.error(err)
                    return -1
                };
                return 0
            }
        }
        this.booking = {
            add: async (data) => {
                let result = await this.search(`SELECT * FROM booking WHERE equipment_id = ? AND (? < end_time AND ? > start_time) AND status = ?;`, [data.equipment_id, data.start, data.end, 0])
                if (result.code < 0) return -1;

                if (result.data.length > 0) return -2;

                let err = await this.runSync(`INSERT INTO booking (uid, equipment_id, start_time, end_time) VALUES (?, ?, ?, ?);`, [data.uid, data.equipment_id, data.start, data.end])
                if (err) return -1;
                return 0
            },
            get: async (equipment_id = null, from = null, to = null, status = null) => {
                if (status === null) {
                    if (equipment_id === null) {
                        return await this.search(`SELECT booking_id, start_time, end_time, user.uid, username, realname FROM user INNER JOIN booking ON user.uid = booking.uid WHERE (booking.start_time >= ? AND booking.start_time < ?)`, [from, to])
                    }
                    return await this.search(`SELECT booking_id, start_time, end_time, user.uid, username, realname FROM user INNER JOIN booking ON user.uid = booking.uid WHERE (booking.equipment_id = ? AND (booking.start_time >= ? AND booking.start_time < ?))`, [equipment_id, from, to])
                }
                if (equipment_id === null) {
                    return await this.search(`SELECT booking_id, start_time, end_time, status, user.uid, username, realname FROM user INNER JOIN booking ON user.uid = booking.uid WHERE ((booking.start_time >= ? AND booking.start_time < ?) AND booking.status = ?)`, [from, to, status])
                }
                return await this.search(`SELECT booking_id, start_time, end_time, status, user.uid, username, realname FROM user INNER JOIN booking ON user.uid = booking.uid WHERE (booking.equipment_id = ? AND (booking.start_time >= ? AND booking.start_time < ?) AND booking.status = ?)`, [equipment_id, from, to, status])
            }
        }

        this.equipment = {
            get: async (status = null) => {
                if (status === null) {
                    return await this.search(`SELECT * FROM equipment;`)
                }
                return await this.search(`SELECT * FROM equipment WHERE status = ?;`, [status])
            }
        }
    }

    async reset() {
        this.sqlite = await this.sqlite.reset()
        this.db = this.sqlite.db
        return this
    }

    async runSync(sql, param = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, param, (err) => {
                if (err) {
                    global.logger.error(err)
                    return resolve(err)
                }
                return resolve()
            })
        })
    }
    async search(sql, param = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, param, (err, rows) => {
                if (err) {
                    global.logger.error(err)
                    return reject({
                        code: -1,
                        msg: err
                    })
                }
                return resolve({
                    code: 0,
                    msg: 'ok',
                    data: rows
                })
            })
        })
    }
}


module.exports = db;