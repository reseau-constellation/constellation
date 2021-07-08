<template>
  <v-chip
    outlined
    small
    label
    class="ma-1 my-1"
  >
    <v-icon small left color="success">
      mdi-check
    </v-icon>
    {{ $t(`licences.droits.${droit}`) }}
  </v-chip>
</template>

<script>
export default {
  name: "jetonDroit",
  props: ["droit"]
}
</script>

<style>

</style>
