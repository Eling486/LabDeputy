const express = require('express');
const router = express.Router();
const { sendJSON } = require('../../../response')
const { refresh } = require('../../../user')

router.post('/', async function (req, res, next) {
    let tokenBase64 = req.headers['authorization']
    let data = await refresh(tokenBase64)
    if (data.code < 0) {
        sendJSON({
            req, res,
            code: data.code
        });
    }
    sendJSON({
        req, res,
        code: 0,
        data: data.data
    });
    next();
});


module.exports = router;