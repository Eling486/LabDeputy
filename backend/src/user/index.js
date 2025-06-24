const Login = require('./login')
const Invite = require('./invite')
const Register = require('./register')
const Validate = require('./validate')
const Update = require('./update')
const Rename = require('./rename')
const Refresh = require('./refresh')

const user = {
    login: Login,
    invite: Invite,
    register: Register,
    validate: Validate,
    update: Update,
    rename: Rename,
    refresh: Refresh,
    state: null,
    permit: null
}

module.exports = user