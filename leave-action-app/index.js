var express = require('express');
var bodyParser = require('body-parser');
let moment = require('moment');
let val = require('./src/validate/leave_validate');
let work = require('./src/validate/work_days');
const port = 3000;

var app = express();

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// POST /api/leaveApply gets JSON bodies
app.post('/api/leaveApply', jsonParser, async function (req, res) {
    // check for from date and to date 
    console.dir(req.body, { depths: null, colors: true });
    let from_date = req.body.input.arg1.fromDate;
    let to_date = req.body.input.arg1.toDate;
    let type_of_leave = req.body.input.arg1.typeOfLeave;
    let reason = req.body.input.arg1.reason;
    let user_id = req.body.input.arg1.userId;
    let retObj = {};
    console.log("from date " + from_date);
    console.log("to date " + to_date);
    console.log("type of leave " + type_of_leave);
    try {
        //check if from_date is later than to_date 
        retObj = await val.validate_and_apply_leave(from_date, to_date, user_id, type_of_leave, reason);
        console.log("return value " + JSON.stringify(retObj));
        if (retObj.error.code != "") {
            res.status(422).json(retObj.error);
        }
        else {
            res.json(retObj);
        }
    }
    catch (e) {
        console.log("System Error in leave application" + e);
        res.status(500).send(e.message);
    }

});

app.post('/api/getWorkingDays', jsonParser, async function (req, res) {
    try {
        let resultJson = await workingday_query(req, res);
        res.json(resultJson);
    }
    catch (error) {
        res.status(500).json(error);

    }
});

function workingday_query(req, res) {
    return new Promise(async function (resolve, reject) {
        console.log("inside workingday_query");
        let from_date = req.body.input.arg1.fromDate;
        let to_date = req.body.input.arg1.toDate;
        let user_id = req.body.input.arg1.userId;
        console.log("inside workingday_query : from_date " + from_date);
        console.log("inside workingday_query : to_date " + to_date);
        console.log("inside workingday_query : user_id " + user_id);
        let resultJson = await work.work_days(from_date, to_date, user_id);
        console.log(resultJson);
        resolve(resultJson);
    });

}

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
