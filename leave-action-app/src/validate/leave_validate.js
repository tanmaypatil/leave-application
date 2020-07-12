
let moment = require('moment');
let work = require('./work_days');
let util = require('../util/util');

function validate_and_apply_leave(from_date, to_date,user_id) {
    let error = {};
    //check if from_date is later than to_date 
    if (moment(from_date).isAfter(to_date)) {
        console.log("invalid from date");
        error.message = "Leave from date needs to earlier than leave from date";
        error.code = 'E0001';
    }
    else {
        error = validate_date_weekend(from_date," from date");
        if ( !error.code) {
            error = validate_date(to_date," to date");
        }
    }
    return error;
}

/* function to validate leave from date and leave to date
   specifically check if either from date or to date falls on the weekend 
*/
function validate_date_weekend(inp_date_str, leave_ind) {
    console.log(inp_date_str);
    let error = {};
    let inp_date = new Date(inp_date_str);
    let day = inp_date.getDay();
    // It is a weekend , it is already holiday
    if (day === 0 || day === 6) {
        error.message =
            "Weekend can not be selected for leave " +
            leave_ind +
            " :  " +
            inp_date_str;
        error.code = 'E0002';
    }
    return error;
}

/* function calculates the working days between from date and to date 
*  checks also leave balance for the user id.
*  if balance is insufficient , it will send error back
*/
async function check_leave_balance(user_id) {
    let leave_objs = await work.work_days(from_date,to_date,user_id);
    let leaves_available = fetch_leaves(user_id);

}

function fetch_leaves(user_id) {
    let query = util.getGraphQLQueryStr('../graphql/get_user_leave_bal.gql');
    let variables = {
        userId : user_id ,
    }
    let response = util.executeGraphQLQuery(query,variables);

}




module.exports = {
    validate_and_apply_leave: validate_and_apply_leave
   
};

