<template>
  <div id="app">
    <h1>Leave Application </h1>
     <b-card no-body>
    <b-tabs pills card vertical>
      <b-tab title="Apply Leave " active> <leave-apply :key="componentKey" v-on:ChangeView="this.forceRerender"></leave-apply></b-tab>
      <b-tab title="Approve leave"> <leave-approve> </leave-approve> </b-tab>
      <b-tab title="Tab 3"><b-card-text>Tab contents 3</b-card-text></b-tab>
    </b-tabs>
  </b-card>
   
    <b-modal id="bv-modal-example" hide-footer>
      <div class="d-block text-center">
        <h3>Leave applied successfully</h3>
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
      componentKey: 0
    };
  },
  methods: {
    forceRerender() {
      console.log("Rerender the leave application display");
      this.$bvModal.show("bv-modal-example");
      this.componentKey += 1;
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
