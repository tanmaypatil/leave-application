<template>
  <div id="app">
    <h1> Apply Leave </h1>
<leave-apply/>
  </div>
</template>

<script>

import LeaveApply from './components/LeaveApply.vue'

export default {
  name: 'App',
  components: {
    LeaveApply
  }
}
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
