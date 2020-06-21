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
      selectMode: "multi",
      items: [],
      fields: ["selected", "from_date", "to_date", "working_days"],
      selected: []
    };
  },
  methods: {
    onRowSelected(items) {
      this.selected = items;
    }
  },
  created() {
    let row = {};
    row.from_date = "2020-02-02";
    row.to_date = "2020-02-03";
    row.working_days = 2;
    this.items.push(row);

    row = {};
    row.from_date = "2020-02-04";
    row.to_date = "2020-02-06";
    row.working_days = 3;
    this.items.push(row);
  }
};
</script>
