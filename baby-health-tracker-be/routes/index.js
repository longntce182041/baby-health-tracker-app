var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.send('Baby Health Tracker API');
});

module.exports = router;
