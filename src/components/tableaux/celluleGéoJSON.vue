<template>
  <span>
    <span v-if="val">{{ val }}</span>
    <v-text-field v-else-if="editer" dense hide-details></v-text-field>
  </span>
</template>

<script>
export default {
  name: "celluleGéoJSON",
  props: ["val", "editer"],
};
</script>

<style></style>
