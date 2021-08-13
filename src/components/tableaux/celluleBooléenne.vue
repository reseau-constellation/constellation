<template>
  <v-simple-checkbox
    v-show="val !== undefined || editer"
    :value="val"
    :disabled="!editer"
    :indeterminate="val === undefined"
    :color="editer ? 'couleurActive' : 'secondary'"
    :ripple="false"
    @click="actionClic"
  />
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "celluleBooléenne",
  props: ["val", "editer", "couleurActive"],
  methods: {
    actionClic: function () {
      if (this.editer) {
        const val =
          this.val === false ? true : this.val === true ? undefined : false;
        this.$emit("edite", { val });
      }
    },
  },
});
</script>

<style></style>
