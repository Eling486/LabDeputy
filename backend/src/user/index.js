const Login = require('./login')
const Validate = require('./validate')
const Update = require('./update')
const Rename = require('./rename')
const Refresh = require('./refresh')

const user = {
    login: Login,
    validate: Validate,
    update: Update,
    rename: Rename,
    refresh: Refresh,
    state: null,
    permit: null
}

module.exports = user