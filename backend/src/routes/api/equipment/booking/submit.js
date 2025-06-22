const express = require('express');
const moment = require('moment');
const router = express.Router();
const { sendJSON } = require('../../../../response')
const { validate } = require('../../../../user')
const { booking } = require('../../../../utils')

router.post('/', async function (req, res, next) {
    let loginState = await validate(req)
    if (!loginState.logined) {
        sendJSON({
            req, res,
            code: -50101
        });
        return next();
    }

    let failList = []

    for (let i = 0; i < req.body.booking_list.length; i++) {
        let bookingItem = req.body.booking_list[i]
        let start = moment(`${bookingItem.date} ${bookingItem.start}`).valueOf()
        let end = moment(`${bookingItem.date} ${bookingItem.end}`).valueOf()
        
        if (typeof start !== 'number' || typeof end !== 'number' || end <= start) {
            failList.push(bookingItem)
            continue
        }

        let result = await booking.addBooking({
            equipment_id: req.body.equipment_id,
            start: start,
            end: end,
            uid: loginState.payload.uid
        })
        if (result < 0) failList.push(bookingItem)
    }

    if (failList.length > 0){
        sendJSON({
            req, res,
            code: -505,
            data: failList
        });
        return next();
    }

    sendJSON({
        req, res,
        code: 0
    });
    return next();
})

module.exports = router;