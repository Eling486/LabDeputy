const express = require('express');
const moment = require('moment')
const router = express.Router();
const { sendJSON } = require('../../../../../response')
const { validate } = require('../../../../../user')
const { booking } = require('../../../../../utils')

router.get('/', async function (req, res, next) {
    let loginState = await validate(req)
    if (!loginState.logined) {
        sendJSON({
            req, res,
            code: -50101
        });
        return next();
    }

    if (!req.query.date) {
        req.query.date = moment().format('YYYY-MM-DD')
    }

    if (!req.query.equipment_id) {
        sendJSON({
            req, res,
            code: -503
        });
        return next();
    }

    let from = moment(req.query.date).startOf('isoWeek')
    let to = from.clone().add(1, 'weeks')

    let result = await booking.getBookingByPeriod(from.valueOf(), to.valueOf(), req.query.equipment_id)

    if (result.code !== 0) {
        sendJSON({
            req, res,
            code: -500
        });
        return next();
    }

    let booking_list = []

    for (let i = 0; i < result.data.length; i++) {
        let booking = result.data[i]
        let name = result.data[i].realname
        let start_time = moment(result.data[i].start_time)
        let end_time = moment(result.data[i].end_time)
        if (!name) name = result.data[i].username
        booking_list.push({
            booking_id: booking.booking_id,
            date: start_time.format('YYYY-MM-DD'),
            start: start_time.format('HH:mm'),
            end: end_time.format('HH:mm'),
            user: {
                uid: result.data[i].uid,
                realname: name
            }
        })
    }

    sendJSON({
        req, res,
        code: 0,
        data: {
            monday: from.format('YYYY-MM-DD'),
            time_slots: booking_list
        }
    });
    return next();
})

module.exports = router;