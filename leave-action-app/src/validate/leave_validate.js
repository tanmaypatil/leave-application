
let moment = require('moment');

function validate_leave(from_date,to_date) {
    let error = {} ;
    //check if from_date is later than to_date 
    if (moment(from_date).isAfter(to_date)) {
        console.log("invalid from date");
        error.message = "invalid date";
        error.code = 'E0001';
    }
    return error;

}

module.exports = {
    validate_leave : validate_leave
};