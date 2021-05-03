<template>
  <span>
    <span v-if="val">{{ val }}</span>
  </span>
</template>

<script>
export default {
  name: "celluleGéoJSON",
  props: ["val", "editer"],
};
</script>

<style></style>
