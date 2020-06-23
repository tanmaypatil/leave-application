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
      fields: ["selected", "emp_name","from_date", "to_date", "working_days","reason"],
      selected: []
    };
  },
  methods: {
    onRowSelected(items) {
      this.selected = items;
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
            row.emp_name = leave.employee.emp_name;
            row.from_date = leave.from_date;
            row.to_date = leave.to_date;
            row.working_days = leave.working_days;
            row.reason = leave.reason;
           
            this.items.push(row);
          }
        }
      })
      .catch(error => {
        console.log("error is " + error);
      });
  }
};
</script>
