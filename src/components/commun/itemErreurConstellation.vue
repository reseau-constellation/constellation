<template>
  <v-list-group
    :value="false"
    color="error"
    prepend-icon="mdi-alert-circle-outline"
    :sub-group="sousGroupe"
  >
    <template v-slot:activator>
      <v-list-item-content>
        <v-list-item-title
          >{{ erreur.name }}: {{ erreur.message }}</v-list-item-title
        >
      </v-list-item-content>
    </template>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="mb-2">
          {{ $t("itemErreurConstellation.Tracé") }}
        </v-list-item-title>
        {{ erreur.stack }}
      </v-list-item-content>
    </v-list-item>
  </v-list-group>
</template>

<script>
export default {
  name: "itemErreurConstellation",
  props: ["erreur", "sousGroupe"],
};
</script>

<style></style>
