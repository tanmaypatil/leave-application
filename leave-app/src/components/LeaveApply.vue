<template>
  <div id="leave-apply">
    <b-card no-body>
      <b-row>
        <b-col cols="4">
          <label for="leave-frdatepicker">Leave from date</label>
          <b-form-datepicker
            id="leave-frdatepicker"
            v-model="fromdate"
            :state="leave_from_date_state"
            class="mb-2"
          ></b-form-datepicker>
          <label for="leave-todatepicker">Leave to date</label>
          <div>
            <b-form-datepicker
              v-on:input="calculate_leave_days"
              id="leave-todatepicker"
              v-model="todate"
              :state="leave_to_date_state"
              class="mb-2"
            ></b-form-datepicker>
          </div>
          <b-form-textarea id="working-days" plaintext :value="leave_days"></b-form-textarea>
          <label for="type-of-leave">type of leave</label>
          <b-form-select
            id="type-of-leave"
            v-model="selected"
            :options="options"
            size="sm"
            class="mt-3"
          ></b-form-select>
          <label for="reason">reason of leave</label>
          <b-form-textarea
            id="reason"
            v-model="reason"
            placeholder="Enter leave reason"
            rows="3"
            max-rows="6"
          ></b-form-textarea>
          <b-button v-on:click="apply" class="mt-4" pill variant="primary">Apply Leave</b-button>
        </b-col>
        <b-col cols="8">
          <b-card-body title="Leave Information">
            <b-card-text>
              <label for="error-panel">Errors:</label>
              <b-form-textarea id="error-panel" plaintext :value="error_message"></b-form-textarea>
              <b-form-textarea
                id="sick-leave-detail"
                size="sm"
                rows="1"
                plaintext
                :value="sick_leave"
              ></b-form-textarea>
              <b-form-textarea
                id="earned-leave-detail"
                size="sm"
                rows="1"
                plaintext
                :value="earned_leave"
              ></b-form-textarea>
              <div>
                <b-table striped hover :items="items"></b-table>
              </div>
            </b-card-text>
          </b-card-body>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "leave-apply",
  data() {
    return {
      user_id: 2,
      error_message: "",
      fromdate: null,
      todate: null,
      leave_from_date_state: true,
      leave_to_date_state: true,
      sick_leave: "Sick leave balance :  0.",
      sick_leave_value: 0,
      earned_leave: "Earned leave balance :  0.",
      earned_leave_value: 0,
      leave_days: "Leave applied for : 0 days",
      leave_days_value: 0,
      selected: null,
      options: [
        { value: null, text: "Please select an option" },
        { value: "sick_leave", text: "Sick Leave" },
        { value: "earned_leave", text: "Earned Leave" }
      ],
      reason: "",
      items: []
    };
  },
  methods: {
    update_leave_balance: async function() {
      const update_leave_bal_query = `mutation leave_bal_update($bal : Int , $leave_type : String , $emp_id : Int) {
      update_leave_app_employee_leavebal(
       _set: {bal: $bal, leave_type: $leave_type}, where: {emp_id: {_eq: $emp_id} _and : { leave_type: {_eq: $leave_type }}} ) {
          affected_rows
          returning {
             bal
             leave_type
          }
        }
      }`;

      let new_bal = 0;
      if (this.selected === "sick_leave") {
        new_bal = this.sick_leave_value - this.leave_days_value;
        console.log("new sick leave bal" + new_bal);
      } else {
        new_bal = this.earned_leave_value - this.leave_days_value;
        console.log("new earned leave bal" + new_bal);
      }
      let variables = {
        bal: new_bal,
        leave_type: this.selected,
        emp_id: this.user_id
      };

      const url = "http://localhost:8080/v1/graphql";
      const opts = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: update_leave_bal_query,
          variables: variables
        })
      };

      fetch(url, opts)
        .then(res => res.json())
        .then(result => {
          if (result.data && result.data.update_leave_app_employee_leavebal) {
            // Leave bal update is successful
            if (
              result.data.update_leave_app_employee_leavebal.affected_rows === 1
            ) {
              console.log("balance updated successfully");
              if (this.selected === "sick_leave") {
                this.sick_leave_value = new_bal;
              } else {
                this.earned_leave_value = new_bal;
              }
              // emit a event to parent to rerender the component
              this.$emit("ChangeView");
            }
          }
        })
        .catch(error => {
          console.log("error is " + error.message);
        });
    },
    calculate_leave_days: function() {
      console.log("calculate_leave_days function called ");
      this.work_day_query(this.fromdate, this.todate);
    },
    // function to calculate work days between dates
    work_days: function(from_date, to_date) {
      let leave_days = 0;
      let weeks = 0;
      let date1 = this.$moment(from_date);
      let date2 = this.$moment(to_date);
      let totDays = date2.diff(date1, "days");
      // find out the day of the week - from date
      // convert to date object
      let from_dt = new Date(from_date);
      //let to_dt = new Date(to_date);
      // find out the day of the week
      let from_day = from_dt.getDay();
      //let to_day = to_dt.getDay();
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
    },
    /* Function to fetch work days based on 
       1) weekends 
       2) company holidays 
    */
    work_day_query: function(from_date, to_date) {
      console.log("work day query");
      // call hasura action query
      const work_day_fetch_query = `query workingDays($fromDate : String! , $toDate : String! , $userId : Int!) {
         getWorkingDays(arg1: {fromDate: $fromDate, toDate: $toDate, userId: $userId}){
         leaveDays
        }
       }`;
      let variables = {
          fromDate: from_date,
          toDate: to_date,
          userId: this.user_id
      };

      const url = "http://localhost:8080/v1/graphql";
      const opts = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: work_day_fetch_query,
          variables: variables
        })
      };

      fetch(url, opts)
        .then(res => res.json())
        .then(result => {
          if (result.data && typeof result.data.getWorkingDays.leaveDays === 'number') {
            this.leave_days_value = result.data.getWorkingDays.leaveDays;
            this.leave_days = "Leave applied for : " + this.leave_days_value + " days";
            console.log("leave days value :" + this.leave_days_value);
            if (this.leave_days_value <= 0) {
              this.leave_to_date_state = false;
            } else {
              this.leave_to_date_state = true;
            }
          }
        })
        .catch(error => {
          console.log("Error in work day calculation " + error);
        });
    },
    // function to validate leave from date and leave to date
    validate_date: function(inp_date_str, leave_ind) {
      console.log(inp_date_str);
      let err = "";
      let inp_date = new Date(inp_date_str);
      let day = inp_date.getDay();
      // It is a weekend , it is already holiday
      if (day === 0 || day === 6) {
        err =
          "Weekend can not be selected for leave " +
          leave_ind +
          " :  " +
          inp_date_str;
      }
      return err;
    },
    // function to check if employee has leave balance
    validate_leave_balance: function() {
      let err = "";
      console.log("inside validate_leave_balance");
      console.log(
        "leave type : " +
          this.selected +
          " leave applied for : " +
          this.leave_days_value
      );
      if (this.leave_days_value <= 0) {
        err =
          "invalid leave application , Leave to-date : " +
          this.todate +
          " needs to be higher than Leave from-date : " +
          this.fromdate;
      } else if (
        this.selected === "sick_leave" &&
        this.leave_days_value > this.sick_leave_value
      ) {
        err =
          "You do not have sufficient sick leave balance , leave requested : [ " +
          this.leave_days_value +
          "] , leave balance :  [ " +
          this.sick_leave_value +
          " ]";
        this.leave_to_date_state = false;
      } else if (
        this.selected === "earned_leave" &&
        this.leave_days_value > this.earned_leave_value
      ) {
        err =
          "You do not have sufficient earned leave balance ,leave requested : [ " +
          this.leave_days_value +
          "] , leave balance :  [ " +
          this.earned_leave_value +
          " ]";
        this.leave_to_date_state = false;
      }
      return err;
    },
    apply: function() {
      // Call mutation to add leave to the employee
      const query = `
      mutation apply_leave($from_date : date ,$to_date : date , $type : String , $emp_id : Int,$working_days : Int , $reason : String ) {
      insert_leave_app_leave_applications(objects: {from_date: $from_date, to_date: $to_date, type: $type, emp_id: $emp_id , working_days : $working_days , reason : $reason  }){
         returning {
          id
        }
        affected_rows
      }
    }`;
      let errors = [];
      this.error_message = [];
      // validate from date
      let err = this.validate_date(this.fromdate, "from date");
      if (err != "") errors.push(err);
      // validate to date
      err = this.validate_date(this.todate, "to date");
      if (err != "") errors.push(err);
      // validate leave balance
      err = this.validate_leave_balance();
      if (err != "") errors.push(err);
      // If only no errors , then proceed with leave application
      for (let e of errors) {
        this.error_message = this.error_message + e + "\n";
      }
      // if no errors , proceed for leave application
      if (errors.length === 0) {
        // Calculate working days , leave needs to be applied for working days
        let leave_days = this.work_days(this.fromdate, this.todate);

        let variables = {
          from_date: this.fromdate,
          to_date: this.todate,
          type: this.selected,
          working_days: leave_days,
          emp_id: this.user_id,
          reason: this.reason
        };
        const url = "http://localhost:8080/v1/graphql";
        const opts = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query, variables: variables })
        };

        fetch(url, opts)
          .then(res => res.json())
          .then(result => {
            if (
              result.data &&
              result.data.insert_leave_app_leave_applications
            ) {
              // Leave application is successful
              if (
                result.data.insert_leave_app_leave_applications
                  .affected_rows === 1
              ) {
                // update the leave balance
                this.update_leave_balance();
              }
            }
          })
          .catch(console.error);
      }
    }
  },
  // Fetch the leave data for the employee
  created() {
    // Query to fetch leave balance of employees .
    const query = `
    query leave_ofemp($id: Int) {
    leave_app_employee(where : { id : {_eq : $id} }) {
      emp_name
      leave_applications {
        from_date
        to_date
        type
        working_days
        approved_by
        employeeByApprovedBy {
          emp_name
        }
      }
      employee_leavebals {
        bal
        leave_type
      }
    }
  }`;

    let variables = { id: 2 };
    const url = "http://localhost:8080/v1/graphql";
    const opts = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query, variables: variables })
    };

    // var that = this;
    // Make the graphql call
    fetch(url, opts)
      .then(res => res.json())
      .then(result => {
        let leave_bal = result.data.leave_app_employee[0].employee_leavebals;
        // update leave balance for the screen
        for (let bal of leave_bal) {
          if (bal.leave_type == "earned_leave") {
            this.earned_leave_value = bal.bal;
            this.earned_leave = "Earned leave balance :" + bal.bal;
          } else {
            this.sick_leave_value = bal.bal;
            this.sick_leave = "Sick leave balance :" + bal.bal;
          }
        }
        // Leave application display
        let leave_apps = result.data.leave_app_employee[0].leave_applications;
        let leave_obj = {};
        this.items.length = 0;
        for (let leave of leave_apps) {
          leave_obj = {};
          leave_obj.from_date = leave.from_date;
          leave_obj.to_date = leave.to_date;
          leave_obj.total_leaves = leave.working_days;
          leave_obj.type = leave.type;
          if (leave.employeeByApprovedBy) {
            leave_obj.approved_by = leave.employeeByApprovedBy.emp_name;
          } else {
            leave_obj.approved_by = "to be approved";
          }
          this.items.push(leave_obj);
        }
      })
      .catch(console.error);
  }
};
</script>

