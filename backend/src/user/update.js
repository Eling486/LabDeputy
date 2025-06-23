const { jwt } = require('../utils');
const { createHash } = require('crypto');

const Update = async (uid, username, password) => {
    let pwdSHA256 = createHash('sha256').update(`LabDeputy${username}${password}`).digest('base64');
    
    let resUpdate = await global.db.user.updatePasswordByUid(uid, pwdSHA256)
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

module.exports = Update