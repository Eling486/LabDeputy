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

    let bookingId = req.body.booking_id;
    if (typeof bookingId !== 'number' || bookingId <= 0) {
        sendJSON({
            req, res,
            code: -503
        });
        return next();
    }

    let bookingData = await booking.getBookingByBookingId(bookingId);
    if (bookingData.code < 0) {
        sendJSON({
            req, res,
            code: -500
        });
        return next();
    }

    if (bookingData.data.length === 0) {
        sendJSON({
            req, res,
            code: -503
        });
        return next();
    }

    console.log(bookingData.data[0]);
    console.log(loginState);
    if (bookingData.data[0].uid !== loginState.payload.uid && !loginState.payload.is_admin) {
        sendJSON({
            req, res,
            code: -50102
        });
        return next();
    }

    let result = await booking.cancelBooking(bookingId);
    if (result.code < 0) {
        sendJSON({
            req, res,
            code: result.code
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