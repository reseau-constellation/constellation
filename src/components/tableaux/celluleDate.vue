<template>
  <span>
    <span v-if="val">{{ new Date(val).toLocaleDateString($i18n.locale) }}</span>
    <v-text-field v-else-if="editer" dense hide-details></v-text-field>
  </span>
</template>

<script>
export default {
  name: "celluleDate",
  props: ["val", "editer"],
};
</script>

<style></style>
