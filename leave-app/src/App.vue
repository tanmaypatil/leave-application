<template>
  <div id="app">
    <h1>Apply Leave</h1>
    <leave-apply :key="componentKey"  v-on:ChangeView="this.forceRerender" ></leave-apply>
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

export default {
  name: "App",
  components: {
    LeaveApply
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
