<template>
  <span>
    <span v-if="val">{{ new Date(val).toLocaleDateString($i18n.locale) }}</span>
  </span>
</template>

<script>
export default {
  name: "celluleDate",
  props: ["val", "editer"]
};
</script>

<style></style>
