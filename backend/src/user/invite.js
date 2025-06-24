const { jwt } = require('../utils');
const { createHash } = require('crypto');

const randomString = (len) => {
    len = len || 32;
    var lib = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890",
        result = "";
    for (let i = 0; i < len; i++) result += lib.charAt(Math.floor(Math.random() * lib.length));
    return result
}

const Invite = async (count) => {
    let invitation = randomString(12)

    let resInvitation = await global.db.user.getByInvitation(invitation)

    if (resInvitation.data.length > 0) return {
        code: -500,
        msg: 'Please try again'
    }

    let err = null
    for (let i = 0; i < count; i++) {
        err = await global.db.user.addInvitation(invitation)
        if (err) break
    }

    if (err) return {
        code: -500
    }

    return {
        code: 0,
        msg: 'ok',
        data: invitation
    }
}

module.exports = Invite