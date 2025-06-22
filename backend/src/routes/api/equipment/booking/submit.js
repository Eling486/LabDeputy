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
        let result = await booking.addBooking({
            equipment_id: req.body.equipment_id,
            start: moment(`${bookingItem.date} ${bookingItem.start}`).valueOf(),
            end: moment(`${bookingItem.date} ${bookingItem.end}`).valueOf(),
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