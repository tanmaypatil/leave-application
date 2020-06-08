<template>
  <div id="leave-apply">
    <b-card no-body>
      <b-row>
        <b-col></b-col>
        <b-col>
          <label for="leave-datepicker">Apply Leave For</label>
          <b-form-datepicker id="leave-datepicker" v-model="value" class="mb-2"></b-form-datepicker>
          <b-form-select v-model="selected" :options="options" size="sm" class="mt-3"></b-form-select>
          <b-button class="mt-4" pill variant="primary">Apply Leave</b-button>
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
      value: null,
      sick_leave: "Sick leave balance :  0.",
      earned_leave: "Earned leave balance :  0.",
      selected: null,
      options: [
        { value: null, text: "Please select an option" },
        { value: "s", text: "Sick Leave" },
        { value: "b", text: "Earned Leave" }
      ],
      items: [
      ]
    };
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

  let variables = { id : 2}
  const url = "http://localhost:8080/v1/graphql";
  const opts = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query : query ,
                         variables : variables})
  };

 // var that = this;
  // Make the graphql call 
  fetch(url, opts)
     .then(res => res.json())
     .then(result => {
       let leave_bal = result.data.leave_app_employee[0].employee_leavebals;
       // update leave balance for the screen
       for(let bal of leave_bal) {
         if (bal.leave_type == "earned") {
           this.earned_leave = "Earned leave balance :"+bal.bal;
         }
         else {
           this.sick_leave = "Sick leave balance :"+bal.bal;
         }
       }
       // Leave application display 
       let leave_apps = result.data.leave_app_employee[0].leave_applications;
       let leave_obj = {};
       this.items.length = 0;
       for ( let leave of leave_apps) {
          leave_obj = {} ; 
          leave_obj.Date = leave.from_date ;
          leave_obj.type = leave.type ;
          leave_obj.approved_by = leave.employeeByApprovedBy.emp_name;  
          this.items.push(leave_obj); 
       }
     })
     .catch(console.error);
  
},


};
</script>

