<template>
  <span>
    <v-checkbox
      v-model="valÉditée"
      class="my-0"
      dense
      hide-details
      color="primary"
      :disabled="!editer"
    ></v-checkbox>
  </span>
</template>

<script>
import mixinLangues from "@/mixins/langues";

export default {
  name: "celluleBooléenne",
  props: ["val", "editer"],
  data: function() {
    return {
      valÉditée: this.val
    };
  },
  mixins: [mixinLangues]
};
</script>

<style></style>
