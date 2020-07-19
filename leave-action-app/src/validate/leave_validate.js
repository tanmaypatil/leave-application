
let moment = require('moment');
let work = require('./work_days');
let util = require('../util/util');

async function validate_and_apply_leave(from_date, to_date, user_id, leave_type, reason) {
    let retObj = { error: {} };
    let leaves_requested = 0 ;
    let leaves_available = 0;
    //check if from_date is later than to_date 
    if (moment(from_date).isAfter(to_date)) {
        console.log("invalid from date");
        retObj.error.message = `Leave from date [ ${from_date} ] needs to earlier than leave to date [ ${to_date} ] `;
        retObj.error.code = 'E0001';
    }
    else {
        // check if leave from date falls on weekend.
        console.log("checking for weekend for from date");
        retObj.error = validate_date_weekend(from_date, " from date");
        if (retObj.error.code !== "")
            return retObj;
        /* check if leave to date  falls on weekend.
           if error , return 
        */
        console.log("checking for weekend for to date");
        retObj.error = validate_date_weekend(to_date, "to date");
        if (retObj.error.code !== "")
            return retObj;

        // check for leave balance before proceeding 
        retObj = await check_leave_balance(from_date, to_date, user_id, leave_type);
        if (retObj.error.code == "") {
            // save leave requested and available , will get overwritten in next call
            leaves_requested = retObj.leaves_requested ;
            leaves_available = retObj.leaves_available;
            console.log(" leave requested "+leaves_requested + " available "+leaves_available);
            // no error insert leave application 
            retObj = await apply_leave(from_date, to_date, user_id, leave_type, reason, leaves_requested);
            // no error update leave balance
            if(retObj.error.code == "")
               retObj = await leave_bal_update(user_id, leaves_requested, leaves_available,leave_type);
        }
    }
    // If we have come so far , and error is null , leave application is success
    if ( retObj.error.code == "" ) {
        retObj.message = `Leave application (${leave_type}) successful from ${from_date} to ${to_date} for ${leaves_requested} day ,current leave balance ${retObj.curBal}`;
        retObj.error = { code: '' };
    }
    console.log("validate_and_apply_leave " + JSON.stringify(retObj));
    return retObj;
}

/* function to validate leave from date and leave to date
   specifically check if either from date or to date falls on the weekend 
*/
function validate_date_weekend(inp_date_str, leave_ind) {
    console.log(inp_date_str);
    let error = { code: '' };
    let inp_date = new Date(inp_date_str);
    let day = inp_date.getDay();
    let weekend = '';
    switch (day) {
        case 0:
            weekend = 'Sunday';
            break;
        case 6:
            weekend = 'Saturday';
            break;
    }
    // It is a weekend , it is already holiday
    if (day === 0 || day === 6) {
        error.message =
            `Weekend ( ${weekend} ) can not be selected for leave ${leave_ind} :  ${inp_date_str}`;
        error.code = 'E0002';
    }
    return error;
}

/* function calculates the working days between from date and to date 
*  checks also leave balance for the user id.
*  if balance is insufficient , it will send error back
*/
async function check_leave_balance(from_date ,to_date ,user_id ,leave_type) {
    let retObj = {
        error: { code: '' }
    };
    let leave_objs = await work.work_days(from_date, to_date, user_id);
    console.log("Leave's requested " + leave_objs.leaves_requested);
    let leaves_available = await fetch_leaves(user_id, leave_type);
    console.log("Leave's available " + leaves_available);
    if (leave_objs.leaves_requested > leaves_available) {
        retObj.error.code = 'E0003';
        retObj.error.message = `You do not have sufficient leave (${leave_type}) balance available ,leave requested [ ${leave_objs.leaves_requested}] , Leave available [ ${leaves_available} ]`;
        return retObj;
    }
    else {
        retObj.leaves_requested = leave_objs.leaves_requested;
        retObj.leaves_available = leaves_available;
    }
    return retObj;

}

async function fetch_leaves(user_id, leave_type) {
    let query = util.getGraphQLQueryStr('src/graphql/get_user_leave_bal.gql');
    let variables = {
        userId: user_id
    };
    let response = await util.executeGraphQLQuery(query, variables);
    if (response.data && response.data.leave_app_employee_leavebal) {
        for (let leave_rec of response.data.leave_app_employee_leavebal) {
            if (leave_rec.leave_type === leave_type) {
                return leave_rec.bal;
            }
        }
    }
    return 0;
}

/*  All validations have passed 
 *  Leave have to be inserted into leave application table.
 *  we will use hasura mutation to insert into table.
*/
async function apply_leave(from_date, to_date, user_id, leave_type, reason, work_days) {
    let query = util.getGraphQLQueryStr('src/graphql/leave_apply.gql');
    let variables = {
        from_date: from_date,
        to_date: to_date,
        leave_type: leave_type,
        emp_id: user_id,
        reason: reason,
        working_days : work_days
    };
    let retObj = {};
    let response = await util.executeGraphQLQuery(query, variables);
    console.log("response apply_leave "+JSON.stringify(response));
    if(response && response.errors) {
        retObj.message = `Leave application unsuccessful from  ${from_date}  to  ${to_date} for ${work_days}`;
        retObj.error = {
            code: 'E0004',
            message: 'Error occured while saving leave application'
        };
    }
    else if (response && response.data.insert_leave_app_leave_applications) {
        retObj.message = `Leave application successful from   ${from_date} to  ${to_date} for  ${work_days}`;
        retObj.error = { code: '' };
    }
    return retObj;
}

async function leave_bal_update(user_id, leaves_requested, leaves_available, leave_type) {
    let retObj = {};
    let leave_balance = leaves_available - leaves_requested;
    let query = util.getGraphQLQueryStr('src/graphql/leave_bal_update.gql');
    let variables = {
        bal: leave_balance,
        emp_id: user_id,
        leave_type: leave_type
    };
    let response = await util.executeGraphQLQuery(query, variables);
    console.log("leave balance update "+JSON.stringify(response));
    if ( response && response.errors) {
        retObj.error = {
            code: 'E0004',
            message: 'error while updating leave balance',
            errObj: response.errors

        };
    }
    if (response && response.data.update_leave_app_employee_leavebal) {
        if (response.data.update_leave_app_employee_leavebal.affected_rows == 1) {
            retObj.error = { code : ''};
            retObj.message = 'Leave balance updated correctly';
            retObj.curBal = leave_balance;
        }
    }
   
    return retObj;
}

module.exports = {
    validate_and_apply_leave: validate_and_apply_leave

};

