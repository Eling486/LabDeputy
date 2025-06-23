const { jwt } = require('../utils');
const { createHash } = require('crypto');
const validate = require('./validate')

const Refresh = async (data) => {
    let validateRes = await validate(data)

    if(!validateRes.logined) {
        return {
            code: -50106,
            msg: 'Illegal token',
        }
    }

    let result = await global.db.user.getByUid(validateRes.payload.uid)

    if (result.code < 0) return {
        code: result.code,
        msg: result.err
    }

    let admin = false
    if (result.data[0].is_admin == 1) {
        admin = true
    }
    let payload = {
        uid: result.data[0].uid,
        username: result.data[0].username,
        realname: result.data[0].realname,
        is_admin: admin,
        login_time: Date.now(),
    }
    let tokenBase64 = jwt.signToken(payload);

    return {
        code: 0,
        msg: 'ok',
        data: tokenBase64
    }
}

module.exports = Refresh