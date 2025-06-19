const schedule = require('node-schedule');

class ScheduleManager {
    constructor() {
        this.init()
        return this
    }

    init() {
        this.jobList = {
            /*RenameFiles: schedule.scheduleJob(RenameFiles.cron, async () => {
                await RenameFiles.work()
            }),*/
        }
    }

    restart() {
        Object.getOwnPropertyNames(this.jobList).forEach((key) => {
            this.jobList[key].cancel()
        })
        this.init()
        return this
    }
}

module.exports = ScheduleManager;