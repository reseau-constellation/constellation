<template>
  <span>
    <span v-if="val">{{ formatterChiffre(val) }}</span>
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
