const express = require('express');
const router = express.Router();
const path = require('path')

router.get('/', async function (req, res, next) {
  return res.sendFile(path.resolve('./src/view/index.html'))
  next();
});


module.exports = router;
