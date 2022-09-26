<template>
  <v-tooltip>
    <template v-slot:activator="{ on, attrs }">
      <v-chip v-bind="attrs"
      v-on="on"
      outlined small label class="ma-1 my-1">
        <v-icon small left color="blue"> mdi-information-outline </v-icon>
        {{ $t(`licences.conditions.${condition}`) }}
      </v-chip>
    </template>
    <span>{{ $t(`licences.conditions.détails.${condition}`) }}</span>
  </v-tooltip>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "jetonCondition",
  props: ["condition"],
});
</script>

<style></style>
