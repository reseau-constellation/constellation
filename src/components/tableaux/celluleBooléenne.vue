<template>
  <span>
    <v-simple-checkbox
      v-model="valÉditée"
      v-show="val !== undefined || editer"
      :disabled="!editer"
      :ripple="false"
    ></v-simple-checkbox>
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
  mixins: [mixinLangues],
  watch: {
    valÉditée: function(val) {
      this.$emit("edite", { val })
    }
  }
};
</script>

<style></style>
