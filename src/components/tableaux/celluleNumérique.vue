<template>
  <span>
    <span v-if="val">{{ formatterChiffre(val) }}</span>
    <v-text-field v-else-if="editer" dense hide-details></v-text-field>
  </span>
</template>

<script>
import mixinLangues from "@/mixins/langues";

export default {
  name: "celluleNumérique",
  props: ["val", "editer"],
  mixins: [mixinLangues]
};
</script>

<style></style>
