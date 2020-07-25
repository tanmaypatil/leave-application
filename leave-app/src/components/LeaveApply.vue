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
                <div class="overflow-auto">
                  <b-pagination 
                   v-model="currentPage"
                   :total-rows="rows"
                   :per-page="perPage"
                  ></b-pagination>
                </div>
                <b-table striped 
                :per-page="perPage"
                :current-page="currentPage"
                hover :items="items"></b-table>
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
      currentPage: 1,
      perPage : 5,
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
  computed: {
      rows() {
        return this.items.length;
      }
    },
  methods: {
    calculate_leave_days: function() {
      console.log("calculate_leave_days function called ");
      this.work_day_query(this.fromdate, this.todate);
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
          if (
            result.data &&
            typeof result.data.getWorkingDays.leaveDays === "number"
          ) {
            this.leave_days_value = result.data.getWorkingDays.leaveDays;
            this.leave_days =
              "Leave applied for : " + this.leave_days_value + " days";
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
    apply: function() {
      /* We will call action api here 
        1. validation will be called from inside action api 
        2. balance check will be done by action api
        3. work_days is also derived by action api
      */
      const query = `
         mutation leave_apply_and_validate(
	          $fromDate: String!
	          $reason: String!
	          $toDate: String!
	          $typeOfLeave: String!
	          $userId: Int!
          ) {
	          leaveValidateAndApply(
		        arg1: {
			         fromDate: $fromDate
			         reason: $reason
			         toDate: $toDate
			         typeOfLeave: $typeOfLeave
			         userId: $userId
		        }
	        ) {
		           message
	          }
          }
        `;

      let variables = {
        fromDate: this.fromdate,
        toDate: this.todate,
        typeOfLeave: this.selected,
        userId: this.user_id,
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
          console.log("result --" + JSON.stringify(result));
          // check for errors
          if (result.errors) {
            console.log(JSON.stringify(result.errors));
            this.error_message = result.errors[0].message;
          } else if (
            result.data &&
            result.data.leaveValidateAndApply &&
            result.data.leaveValidateAndApply.message
          ) {
            // update the leave balance
            //this.update_leave_balance();
            this.$emit("ChangeView", result.data.leaveValidateAndApply.message);
          }
        })
        .catch(errors => {
          console.log("errors " + JSON.stringify(errors));
          this.error_message = errors;
        });
    },
    linkGen(pageNum) {
      console.log("move to page : "+pageNum);
      let path = '/leave-inquiry/' + pageNum;
      return {
        path: path,
        params: { page_number : pageNum }
      }
    },
  },
  watch: {
    $route : function ( to, from) {
      // react to route changes...
      console.log("route changed to " + to);
      console.log("route changed from" + from);
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

