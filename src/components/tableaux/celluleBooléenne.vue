<template>
  <v-simple-checkbox
    v-show="val !== undefined || editer"
    :value="val"
    :disabled="!editer"
    :indeterminate="val === undefined"
    :color="editer ? 'primary' : 'secondary'"
    :ripple="false"
    @click="actionClic"
  />
</template>

<script>
export default {
  name: "celluleBooléenne",
  props: ["val", "editer"],
  methods: {
    actionClic: function() {
      if (this.editer) {
        const val =
          this.val === false ? true : this.val === true ? undefined : false;
        this.$emit("edite", { val });
      }
    }
  }
};
</script>

<style></style>
