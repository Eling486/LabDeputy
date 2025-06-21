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
            updateByUid: async (uid, username, password) => {
                console.log(uid, username, password)
                let err = await this.runSync(`UPDATE user SET username=?, password=? WHERE uid = ?;`, [username, password, uid])
                if (err) {
                    global.logger.error(err)
                    return -1
                };
                return 0
            }
        }
        this.booking = {
            add: async (data) => {
                let result = await this.search(`SELECT * FROM anime WHERE title = ?;`, [data.title])
                if (result.code < 0) return -1;

                let err = await this.runSync(`INSERT INTO anime (title, meta_db, meta_id, meta_update_time, meta_title, season, source, filter, poster_url, poster_path, save_path, is_subscribe, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?, ?, ?);`, [data.title, data.meta_db, data.meta_id, data.meta_update_time, data.meta_title, JSON.stringify([data.season]), data.source, data.filter, data.poster_url, data.poster_path, data.save_path, Number(data.is_subscribe), Date.now()])
                if (err) return -1;

                result = await this.search(`SELECT * FROM anime WHERE title = ?;`, [data.title])
                if (result.code < 0) return -1;
                return result.data[0].aid
            },
            get: async (equipment_id = null, from = null, to = null, status = null) => {
                if (!status) {
                    if (!equipment_id) {
                        return await this.search(`SELECT * FROM booking WHERE (start_time >= ? AND start_time < ?)`, [from, to])
                    }
                    return await this.search(`SELECT * FROM booking WHERE equipment_id = ? AND (start_time >= ? AND start_time < ?)`, [equipment_id, from, to])
                }
                if (!equipment_id) {
                    return await this.search(`SELECT * FROM booking WHERE (start_time >= ? AND start_time < ?) AND status = ?`, [from, to, status])
                }
                return await this.search(`SELECT * FROM booking WHERE equipment_id = ? AND (start_time >= ? AND start_time < ?) AND status = ?`, [equipment_id, from, to, status])
            },
            getByTitle: async (title = null) => {
                if (!title) {
                    return await this.search(`SELECT * FROM anime`)
                }
                return await this.search(`SELECT * FROM anime WHERE title = ?`, title)
            },
            updatePoster: async (aid, imgUrl, imgPath) => {
                let err = await this.runSync(`UPDATE anime SET poster_url = ?, poster_path = ? WHERE aid = ?`, [imgUrl, imgPath, aid])
                if (err) return -1;
                return 0;
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