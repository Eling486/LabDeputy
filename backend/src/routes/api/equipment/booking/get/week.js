const express = require('express');
const moment = require('moment')
const router = express.Router();
const { sendJSON } = require('../../../../../response')
const { validate } = require('../../../../../user')
const { booking } = require('../../../../../utils')

router.get('/', async function (req, res, next) {
    let loginState = await validate(req)
    /*if (!loginState.logined) {
        sendJSON({
            req, res,
            code: -50101
        });
        return next();
    }*/

    if(!req.query.date){
        req.query.date = moment().format('YYYY-MM-DD')
    }

    if(!req.query.equipment_id) {
        sendJSON({
            req, res,
            code: -503
        });
        return next();
    }

    let from = moment(req.query.date).startOf('isoWeek')
    let to = from.clone().add(1, 'weeks')

    let result = await booking.getBookingByPeriod(req.query.equipment_id, from.valueOf(), to.valueOf())

    if (result.code !== 0) {
        sendJSON({
            req, res,
            code: -500
        });
        return next();
    }

    sendJSON({
        req, res,
        code: 0,
        data: result.data
    });
    return next();
})

module.exports = router;