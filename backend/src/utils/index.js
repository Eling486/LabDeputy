const network = require('./network')
const jwt = require('./jwt')
const request = require('./request')
const booking = require('./booking')

const utils = {
    network: network,
    jwt: jwt,
    request: request,
    booking: booking
}

module.exports = utils;