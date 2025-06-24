const express = require('express');
const router = express.Router();
const { sendJSON } = require('../../../response')
const { register } = require('../../../user')

router.post('/', async function (req, res, next) {

  if (!req.body.invitation) {
    sendJSON({
      req, res,
      code: -503
    });
    return next();
  }

  let result = await register(req.body.invitation, req.body.username, req.body.password, req.body.realname)
  if(result.code < 0){
    sendJSON({
      req, res,
      code: result.code,
      msg: result.msg
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
