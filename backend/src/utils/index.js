const network = require('./network')
const jwt = require('./jwt')
const request = require('./request')
const booking = require('./booking')
const equipment = require('./equipment')

const utils = {
    network: network,
    jwt: jwt,
    request: request,
    equipment: equipment,
    booking: booking
}

module.exports = utils;