var express = require('express');
var bodyParser = require('body-parser');
let moment = require('moment');
let val = require('./src/validate/leave_validate');
const port = 3000 ;

var app = express();

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// POST /api/leaveApply gets JSON bodies
app.post('/api/leaveApply', jsonParser, function (req, res) {
    // check for from date and to date 
    console.dir(req.body , { depths : null , colors : true });
    let from_date = req.body.input.arg1.fromDate ;
    let to_date = req.body.input.arg1.toDate ;
    let error = {};
    console.log("from date "+from_date);
    console.log("to date "+to_date);
    //check if from_date is later than to_date 
    error = val.validate_leave(from_date,to_date);
    if (error.code ) {
        res.status(422).json(error);
    }
    else {
        let message = "leave appiled successfully";
        res.json ( { message : message});

    }

  });

  app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
