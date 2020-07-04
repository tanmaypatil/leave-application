<template>
  <div id="holidays">
    <div>
      <b-row>
        <b-col cols="4">
          <label for="format">view format</label>
          <b-form-select id="format" v-model="viewer" :options="options" size="sm" class="mt-3"></b-form-select>
        </b-col>
      </b-row>
    </div>
    <div v-if="viewer === 'table_view' ">
      <b-table striped hover :items="items"></b-table>
    </div>
    <div v-if="viewer === 'calendar_view'">
      <b-calendar
        block
        :date-info-fn="dateClass"
        v-model="calendarDate"
        @context="onContext"
        locale="en-US"
        :readonly="false"
      >
        <div class="d-flex" dir="ltr">
          <b-form-textarea id="leave-display" plaintext :value="holiday_display"></b-form-textarea>
        </div>
      </b-calendar>
    </div>
  </div>
</template>

<script>
export default {
  name: "holidays",
  data() {
    return {
      user_id: 1,
      entity_id: 3,
      emp_location: "PUN",
      items: [],
      viewer: "table",
      options: [
        { value: null, text: "Please select an option" },
        { value: "table_view", text: "Table" },
        { value: "calendar_view", text: "Calendar" }
      ],
      calendarDate: "",
      holiday_display: "holidays will appear here "
    };
  },
  // Fetch holidays as per user entity id and location id
  created() {
    this.viewer = "table_view";
    console.log("created method of the holiday component");
    const query = `query leaves_applicable($entity_id: Int!, $emp_location: jsonb) {
     leave_app_holidays(
       where: {
         _and: [
           {
             _or: [
               { location_codes: { _contains: $emp_location } }
               { location_codes: { _contains: "ALL" } }
            ]
          }
          { entity_id: { _eq: $entity_id } }
        ]
      }
    ) {
       entity_id
       date
       description
       optional
       location_codes
    }
   }`;

    let variables = {
      entity_id: this.entity_id,
      emp_location: this.emp_location
    };
    const url = "http://localhost:8080/v1/graphql";
    const opts = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query, variables: variables })
    };

    // make graphql api call to fetch holidays as per usr holidays.
    console.log("making graphql call to fetch holiday");
    fetch(url, opts)
      .then(res => res.json())
      .then(result => {
        if (result && result.data && result.data.leave_app_holidays) {
          for (let holRec of result.data.leave_app_holidays) {
            let holObj = {};
            holObj.date = holRec.date;
            holObj.description = holRec.description;
            holObj.optional = holRec.optional;
            this.items.push(holObj);
          }
          console.log(" holiday list");
        }
      })
      .catch(error => {
        console.log("error in displaying holidays" + error);
      });
  },
  methods: {
    daysInMonth: function(month, year) {
      return new Date(year, month+1, 0);
    },
    dateClass(ymd) {
      let holFound = false;
      //const day = date.getDate();
      for (let holObj of this.items) {
        if (ymd === holObj.date) {
          holFound = true;
          break;
        }
      }
      return holFound === true ? "table-info" : "";
    },
    onContext(ctx) {
      let curr_date = ctx.activeDate;
      console.log(curr_date);
      let year = curr_date.getYear();
      let month = curr_date.getMonth();
      console.log("month is "+month);
      let high_date = this.daysInMonth(month,year);
      let low_date = new Date(year,month,1);
      console.log("high date "+high_date);
       console.log("low date "+low_date);
       for (let holObj of this.items) {
           let holStr = holObj.date;
           let holDate = new Date(holStr);
           console.log("holDate "+holDate);
           if ( this.$moment(holStr).isBefore(high_date.toISOString()) && this.$moment(holStr).isAfter(low_date.toISOString())) {
               console.log("holiday found "+holStr);
               this.holiday_display = holStr + " : " + holObj.description + "\n" ;
           }
       }

      //curr_date
    }
  }
};
</script>
