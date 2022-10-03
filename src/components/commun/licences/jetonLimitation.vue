<template>
  <v-tooltip>
    <template v-slot:activator="{ on, attrs }">
      <v-chip v-bind="attrs" v-on="on" outlined small label class="ma-1 my-1">
        <v-icon small left color="error"> mdi-close </v-icon>
        {{ $t(`licences.limitations.${limitation}`) }}
      </v-chip>
    </template>
    <span>{{ $t(`licences.limitations.détails.${condition}`) }}</span>
  </v-tooltip>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "jetonLimitation",
  props: ["limitation"],
});
</script>

<style></style>
