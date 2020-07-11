<template>
  <div id="leave-approve">
    <b-table
      striped
      hover
      selectable
      :select-mode="selectMode"
      :fields="fields"
      :items="items"
      @row-selected="onRowSelected"
    >
      <template v-slot:cell(selected)="{ rowSelected }">
        <template v-if="rowSelected">
          <span aria-hidden="true">&check;</span>
          <span class="sr-only">Selected</span>
        </template>
        <template v-else>
          <span aria-hidden="true">&nbsp;</span>
          <span class="sr-only">Not selected</span>
        </template>
      </template>
    </b-table>
    <b-button v-on:click="approve" class="mt-4" :disabled="approveDisabled" pill variant="primary">Approve Leave</b-button>
  </div>
</template>

<script>
export default {
  name: "leave-approve",
  data() {
    return {
      user_id: 1,
      selectMode: "multi",
      items: [],
      fields: [
        "selected",
        "emp_name",
        "from_date",
        "to_date",
        "working_days",
        "reason"
      ],
      selected: [],
      approveDisabled : false
    };
  },
  methods: {
    onRowSelected(items) {
      this.selected = items;
    },
    approve() {
      console.dir(this.selected, { colors: true, depth: null });
      // update leave for all selected records.
      for (let leave_record of this.selected) {
        this.update_leave(leave_record.id, this.user_id);
      }
    },
    update_leave(leave_id, approver_id) {
      console.log("approving the leave  [ " +leave_id+ " ] ");
      let query = `mutation approve_leave($leave_id: Int, $approver_id: Int) {
	        update_leave_app_leave_applications(
		      _set: { approved_by: $approver_id }
		      where: { id: { _eq: $leave_id } }
          )
          {
		         affected_rows
	        }
        }`;

      /* Input to graphql query 
      1) specific leave id
      2) approver id to update against the leave*/

      let variables = {
        leave_id: leave_id,
        approver_id: approver_id
      };

      // update the leave as approved for a specific leave record
      const url = "http://localhost:8080/v1/graphql";
      const opts = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query, variables: variables })
      };

      // graphql update query check for number of records to check on success
      fetch(url, opts)
        .then(res => res.json())
        .then(result => {
          if (result.data && result.data.update_leave_app_leave_applications) {
            if (result.data.update_leave_app_leave_applications.affected_rows == 1) {
              // update successfully  , pass event to parent
              console.log("leave approved");
              this.$emit("ChangeLeaveApproveView");
            }
          }
        })
        .catch(error => {
          console.log("error is " + error);
        });
    }
  },

  // Fetch leave to be approved for the manager.
  created() {
    let query = ` query leaveTobeApproved($mgr_id: Int) {
	leave_app_leave_applications(
		where: {
			_and: [
				{ employee: { employee: { id: { _eq: $mgr_id } } } }
				{ approved_by: { _is_null: true } }
			]
		}
	) {
    id
    from_date
    to_date
    working_days
    reason
		approved_by
		emp_id
		reason
		employee {
			emp_name
			manager: employee {
				manager_name: emp_name
				manager_id: id
			}
		}
	}
} `;
    // we need to show the leaves which has to be approved by manager.
    let variables = {
      mgr_id: this.user_id
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
        if (result.data && result.data.leave_app_leave_applications) {
          for (let leave of result.data.leave_app_leave_applications) {
            let row = {};
            row.id = leave.id;
            row.emp_name = leave.employee.emp_name;
            row.from_date = leave.from_date;
            row.to_date = leave.to_date;
            row.working_days = leave.working_days;
            row.reason = leave.reason;
            this.items.push(row);
          }
          if ( this.items.length === 0 ) {
            this.approveDisabled = true;
          }
        }
      })
      .catch(error => {
        console.log("error is " + error);
      });
  }
};
</script>
