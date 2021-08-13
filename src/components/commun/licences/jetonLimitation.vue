<template>
  <v-chip outlined small label class="ma-1 my-1">
    <v-icon small left color="error"> mdi-close </v-icon>
    {{ $t(`licences.limitations.${limitation}`) }}
  </v-chip>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "jetonLimitation",
  props: ["limitation"],
});
</script>

<style></style>
