<template>
  <v-simple-checkbox
    v-model="valÉditée"
    v-show="val !== undefined || editer"
    :disabled="!editer"
    :ripple="false"
  ></v-simple-checkbox>
</template>

<script>
export default {
  name: "celluleBooléenne",
  props: ["val", "editer"],
  data: function() {
    return {
      valÉditée: this.val
    };
  },
  watch: {
    valÉditée: function(val) {
      this.$emit("edite", { val })
    }
  }
};
</script>

<style></style>
