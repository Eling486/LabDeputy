const express = require('express');
const router = express.Router();
const { sendJSON } = require('../../../response')
const { validate, invite } = require('../../../user')

router.post('/', async function (req, res, next) {
  let loginState = await validate(req)
  if (!loginState.logined) {
    sendJSON({
      req, res,
      code: -50101
    });
    return next();
  }

  if (!loginState.payload.is_admin) {
    sendJSON({
      req, res,
      code: -50102
    });
    return next();
  }

  if(!req.body.count || (typeof req.body.count !== 'number')) {
    sendJSON({
      req, res,
      code: -503
    });
    return next();
  }

  let result = await invite(req.body.count)
  if (result.code < 0) {
    sendJSON({
      req, res,
      code: result.code,
    });
    return next();
  }
  sendJSON({
    req, res,
    code: 0,
    data: result.data
  });
  return next();
});


module.exports = router;
