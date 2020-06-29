<template>
  <div id="app">
    <h1>Leave Application </h1>
     <b-card no-body>
    <b-tabs v-on:activate-tab="this.switchTab" pills card vertical>
      <b-tab title="Apply Leave " active> <leave-apply :key="componentKey" v-on:ChangeView="this.forceRerender"></leave-apply></b-tab>
      <b-tab title="Approve leave"> <leave-approve :key="approveKey" v-on:ChangeLeaveApproveView="this.reRenderApproveLeave" > </leave-approve> </b-tab>
      <b-tab title="Holidays"><b-card-text>Holiday List</b-card-text></b-tab>
    </b-tabs>
  </b-card>
   
    <b-modal id="bv-modal-example" hide-footer>
      <div class="d-block text-center">
        <h3>{{ message }}</h3>
      </div>
      <b-button class="mt-3" block @click="$bvModal.hide('bv-modal-example')">Close Me</b-button>
    </b-modal>
  </div>
</template>

<script>
import LeaveApply from "./components/LeaveApply.vue";
import LeaveApprove from "./components/LeaveApprove.vue";

export default {
  name: "App",
  components: {
    LeaveApply,
    LeaveApprove
  },
  data() {
    return {
      message : "",
      componentKey: 0,
      approveKey : 0
    };
  },
  methods: {
    switchTab(newTabIndex) {
      if(newTabIndex === 0 ) {
        console.log("leave apply tab clicked");
        this.componentKey++ ;
      }
      else if (newTabIndex === 1 ) {
        console.log("leave approve tab clicked");
        this.approveKey ++;

      }

    },
    forceRerender() {
      console.log("Rerender the leave application display");
      this.message = "Leave applied succesfully";
      this.$bvModal.show("bv-modal-example");
   
      this.componentKey += 1;
    },
    reRenderApproveLeave() {
       console.log("Rerender the leave approval component");
       this.message = "Leave approved succesfully";
       this.$bvModal.show("bv-modal-example");
       this.approveKey += 1;  
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
