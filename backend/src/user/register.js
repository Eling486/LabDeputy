const { jwt } = require('../utils');
const { createHash } = require('crypto');

const Register = async (invitation, username, password, realname) => {
    let resInvitation = await global.db.user.getByInvitation(invitation)

    if (resInvitation.code < 0) return {
        code: data.code,
        msg: data.err
    }

    if (resInvitation.data.length == 0) return {
        code: -50301,
        msg: 'Invalid register link!'
    }

    let resUsername = await global.db.user.getByUsername(username)

    if (resUsername.code < 0) return {
        code: data.code,
        msg: data.err
    }

    if (resUsername.data.length > 0) return {
        code: -50302,
        msg: 'Username already exists'
    }

    let uid = resInvitation.data[0].uid

    let pwdSHA256 = createHash('sha256').update(`LabDeputy${username}${password}`).digest('base64');

    let err = await global.db.user.updateAllByUid(uid, username, pwdSHA256, realname)

    if (err) return {
        code: -500
    }

    return {
        code: 0,
        msg: 'ok',
    }
}

module.exports = Register