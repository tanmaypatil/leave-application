
let moment = require('moment');

function validate_leave(from_date, to_date) {
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

function check_leave_balance(from_date,to_date) {
    let leave_days = work_days(from_date,to_date);

}


/*  calculate work days between from date and to date 
    1. Account for weekends ( Sat and Sun) 
    2. check for holidays as per employees' location .
*/
function work_days(from_date, to_date,user_id) {
    let leave_days = 0;
    let weeks = 0;
    let date1 = this.$moment(from_date);
    let date2 = this.$moment(to_date);
    let totDays = date2.diff(date1, "days");
    // find out the day of the week - from date
    // convert to date object
    let from_dt = new Date(from_date);
    // find out the day of the week
    let from_day = from_dt.getDay();
    /* find out the distance from the first Sunday */
    let dist = 7 - from_day;
    if (totDays > dist) {
      weeks = 1;
      let excess = totDays - dist;
      // check out full weeks
      weeks += Math.floor(excess / 7);
    }
    leave_days = totDays - 2 * weeks + 1;
    return leave_days;
  }

module.exports = {
    validate_leave: validate_leave,
    work_days : work_days
};

