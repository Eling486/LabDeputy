const Rename = async (uid, realname) => {
    let resUpdate = await global.db.user.updateRealnameByUid(uid, realname)
    if (resUpdate < 0) {
        return {
            code: -500,
            msg: 'Server Error'
        }
    }
    return {
        code: 0,
        msg: 'ok',
    }
}

module.exports = Rename