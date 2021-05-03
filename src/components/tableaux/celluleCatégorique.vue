<template>
  <span>
    <span v-if="val">{{ val }}</span>
  </span>
</template>

<script>
export default {
  name: "celluleCatégorique",
  props: ["val", "editer"],
};
</script>

<style></style>
