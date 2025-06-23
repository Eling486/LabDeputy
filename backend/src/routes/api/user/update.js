const express = require('express');
const router = express.Router();
const { sendJSON } = require('../../../response')
const { update, validate, login, rename } = require('../../../user')

router.post('/', async function (req, res, next) {
  let loginState = await validate(req)
  if (!loginState.logined) {
    sendJSON({
      req, res,
      code: -50101
    });
    return next();
  }

  if (!loginState.payload.is_admin && loginState.payload.uid !== req.body.uid) {
    sendJSON({
      req, res,
      code: -50102
    });
    return next();
  }

  if (req.body.password) {
    let login_result = await login(req.body.username, req.body.password.old)

    if (login_result.code < 0) {
      sendJSON({
        req, res,
        code: login_result.code,
      });
      return next();
    }

    let result = await update(req.body.uid, req.body.username, req.body.password.new)

    if (result.code < 0) {
      sendJSON({
        req, res,
        code: result.code,
      });
      return next();
    }
  }

  if (req.body.realname) {
    let result = await rename(req.body.uid, req.body.realname)
    if (result.code < 0) {
      sendJSON({
        req, res,
        code: result.code,
      });
      return next();
    }
  }

  sendJSON({
    req, res,
    code: 0,
  });
  return next();
});


module.exports = router;
