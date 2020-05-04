var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Atherz World' });
});

// download = download a file (res.download(/report-dba6ec24.pdf, Report.pdf))
// end = end the response process
// json send a json
// redirect
// render a view templatre
// send a response of various types (text, number, object, etc)
// send a file
// sendStatus

module.exports = router;
