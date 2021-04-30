<template>
  <span>
    <span v-if="val">{{ val }}</span>
    <v-select v-else-if="editer" dense hide-details></v-select>
  </span>
</template>

<script>
export default {
  name: "celluleCatégorique",
  props: ["val", "editer"],
};
</script>

<style></style>
