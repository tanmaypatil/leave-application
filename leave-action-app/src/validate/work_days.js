let moment = require('moment');
let fs = require('fs');
const util = require('../util/util');

async function work_days(from_date, to_date, user_id) {
    let working_days_obj = {};
    // get entity and location information
    let user_info = await getEntityAndLocation(user_id);
    /* check company holidays ,if they are between 
       from date , to date */
    let holiday_cnt = await check_holidays(from_date, to_date, user_info);
    let leave_days = 0;
    let weeks = 0;
    let date1 = moment(from_date);
    let date2 = moment(to_date);
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
    leave_days = totDays - 2 * weeks + 1 - holiday_cnt;
    working_days_obj.leaveDays = leave_days;

    return working_days_obj;
}

function getEntityAndLocation(user_id) {
    return new Promise(async function (resolve, reject) {
        let query = util.getGraphQLQueryStr('src/graphql/get_user_entity_location.gql');
        console.log(query);
        //console.log(typeof query);
        let variables = {
            user_id: user_id,
        };
        try {
            let jsonResponse = await util.executeGraphQLQuery(query, variables);
            // read entity id and location code and pass back
            let finalResponse = {
                entity_id : jsonResponse.data.leave_app_employee[0].entity_id,
                emp_location : jsonResponse.data.leave_app_employee[0].entity_location.code
            }
            console.log("getEntityAndLocation "+ finalResponse);
            resolve(finalResponse);
        }
        catch(error) {
            console.log(error);
            reject(error);
        }
    });

}

// find out the company declared holidays between 2 days .
function check_holidays(from_date, to_date, user_info) {
    return new Promise(async function (resolve, reject) {
        let query = util.getGraphQLQueryStr('src/graphql/leave_hols_bet_days.gql');
        console.log(query);
        //console.log(typeof query);
        let variables = {
            from_date: from_date,
            to_date: to_date,
            entity_id: user_info.entity_id,
            emp_location: user_info.emp_location
        };

        try {
            let jsonResponse = await util.executeGraphQLQuery(query, variables);
            holidays = jsonResponse.data.leave_app_holidays;
            console.log("Holidays : ");
            console.dir(holidays
                , { depths: null, colors: true });
            if (Array.isArray(holidays)) {
                count = holidays.length;
            }
            console.log("holidays between :" + from_date + " and " + to_date + " are  " + count);
            resolve(count);
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}

module.exports = {
    work_days: work_days,
    check_holidays: check_holidays
}