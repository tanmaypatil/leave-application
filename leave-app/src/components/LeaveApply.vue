<template>
  <div id="leave-apply">
    <b-card no-body>
      <b-row>
        <b-col></b-col>
        <b-col>
          <label for="leave-frdatepicker">Leave from date</label>
          <b-form-datepicker id="leave-frdatepicker" v-model="fromdate" class="mb-2"></b-form-datepicker>
          <label for="leave-todatepicker">Leave to date</label>
          <b-form-datepicker id="leave-todatepicker" v-model="todate" class="mb-2"></b-form-datepicker>
          <b-form-textarea id="working-days" plaintext :value="working_days"></b-form-textarea>
          <label for="type-of-leave">type of leave</label>
          <b-form-select
            id="type-of-leave"
            v-model="selected"
            :options="options"
            size="sm"
            class="mt-3"
          ></b-form-select>
          <b-button v-on:click="apply" class="mt-4" pill variant="primary">Apply Leave</b-button>
        </b-col>
        <b-col cols="6">
          <b-card-body title="Leave Information">
            <b-card-text>
              <label for="error-panel">Errors:</label>
              <b-form-textarea id="error-panel" plaintext :value="error_message"></b-form-textarea>
              <b-form-textarea id="sick-leave-detail" size="sm" rows="1" plaintext :value="sick_leave"></b-form-textarea>
              <b-form-textarea id="earned-leave-detail" size="sm" rows="1" plaintext :value="earned_leave"></b-form-textarea>
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
      error_message: '',
      fromdate: null,
      todate: null,
      sick_leave: "Sick leave balance :  0.",
      earned_leave: "Earned leave balance :  0.",
      working_days: "Leave applied for : 0 days",
      selected: null,
      options: [
        { value: null, text: "Please select an option" },
        { value: "sick_leave", text: "Sick Leave" },
        { value: "earned_leave", text: "Earned Leave" }
      ],
      items: []
    };
  },
  methods: {
    // function to validate leave from date and leave to date
    validate_date: function(inp_date_str, leave_ind) {
      console.log(inp_date_str);
      let err = "";
      let inp_date = new Date(inp_date_str);
      let day = inp_date.getDay();
      // It is a weekend , it is already holiday
      if (day === 0 || day === 6) {
        err =
          "Weekend can not be selected for leave " + leave_ind + " :  " + inp_date_str;
      } 
      return err;
    },
    apply: function() {
      // Call event to add leave to the employee
      const query = `
      mutation apply_leave($from_date : date ,$to_date : date , $type : String , $emp_id : Int,$working_days : Int) {
      insert_leave_app_leave_applications(objects: {from_date: $from_date, to_date: $to_date, type: $type, emp_id: $emp_id , working_days : $working_days}){
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
      if ( err !="" ) errors.push(err);
      // validate to date
      err = this.validate_date(this.todate, "to date");
      if ( err !="" ) errors.push(err);
      // If only no errors , then proceed with leave application
      for ( let e of errors) {
        this.error_message =  this.error_message + e + '\n' ; 
      }
      if (errors.length === 0 ) {
        let variables = {
          from_date: this.fromdate,
          to_date: this.todate,
          type: this.selected,
          working_days: 1,
          emp_id: 2
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
                this.$bvToast.toast(`Leave applied successfully`, {
                  title: "Leave Apply confirmation",
                  autoHideDelay: 5000,
                  appendToast: true
                });
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
          if (bal.leave_type == "earned") {
            this.earned_leave = "Earned leave balance :" + bal.bal;
          } else {
            this.sick_leave = "Sick leave balance :" + bal.bal;
          }
        }
        // Leave application display
        let leave_apps = result.data.leave_app_employee[0].leave_applications;
        let leave_obj = {};
        this.items.length = 0;
        for (let leave of leave_apps) {
          leave_obj = {};
          leave_obj.Date = leave.from_date;
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

