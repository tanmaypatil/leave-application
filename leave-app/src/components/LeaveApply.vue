<template>
  <div id="leave-apply">
    <b-card no-body>
      <b-row>
        <b-col></b-col>
        <b-col>
          <label for="leave-datepicker">Apply Leave For</label>
          <b-form-datepicker id="leave-datepicker" v-model="fromdate" class="mb-2"></b-form-datepicker>
          <b-form-select v-model="selected" :options="options" size="sm" class="mt-3"></b-form-select>
          <b-button v-on:click="apply" class="mt-4" pill variant="primary">Apply Leave</b-button>
        </b-col>
        <b-col cols="6">
          <b-card-body title="Leave Information">
            <b-card-text>
              <b-form-textarea id="leave-detail" plaintext :value="sick_leave"></b-form-textarea>
              <b-form-textarea id="leave-detail" plaintext :value="earned_leave"></b-form-textarea>
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
      fromdate: null,
      sick_leave: "Sick leave balance :  0.",
      earned_leave: "Earned leave balance :  0.",
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
      alert(this.selected);

      let variables = {
        from_date: this.fromdate,
        to_date: this.fromdate,
        type: this.selected,
        working_days : 1,
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
          if (result.data && result.data.insert_leave_app_leave_applications) {
            // Leave application is successful
            if (result.data.insert_leave_app_leave_applications.affected_rows === 1) {
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
          if (leave.employeeByApprovedBy ) {
          leave_obj.approved_by = leave.employeeByApprovedBy.emp_name;
          }
          else {
            leave_obj.approved_by = "to be approved";
          }
          this.items.push(leave_obj);
        }
      })
      .catch(console.error);
  }
};
</script>

