let moment = require('moment');

// find out work days between 2 dates 
// Assumption is that both from_date and to_date are working days 
// only Sat, Sun are not to be considered.
function work_days(from_date,to_date) {
    let work_days = 0 ;
    let weeks = 0;
    let date1 = moment(from_date);
    let date2 = moment(to_date);
    let totDays = date2.diff(date1,'days');
    // find out the day of the week - from date 
    // convert to date object
    let from_dt = new Date(from_date);
    let to_dt = new Date(to_date);
    // find out the day of the week
    let from_day = from_dt.getDay();
    //let to_day = to_dt.getDay();
    /* find out the distance from the first Sunday */
    let dist = 7 - from_day ;
    if ( totDays >dist) {
        weeks = 1;
        let excess = totDays - dist;
        // check out full weeks 
        weeks  += Math.floor(excess / 7) ;
    }
    work_days = totDays - 2 * weeks + 1;
    return work_days;
}

module.exports = { 
    work_days : work_days
};

