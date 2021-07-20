<template>
  <v-chip outlined small label class="ma-1 my-1">
    <v-icon small left color="blue"> mdi-information-outline </v-icon>
    {{ $t(`licences.conditions.${condition}`) }}
  </v-chip>
</template>

<script>
export default {
  name: "jetonCondition",
  props: ["condition"],
};
</script>

<style></style>
