<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline"> Auteurs </v-card-title>
      <v-divider />

      <v-card-text>
        <v-list>
          <item-auteur v-for="auteur in auteurs" :key="auteur" />
        </v-list>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="dialogue = false">
          {{ $t("communs.fermer") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import itemAuteur from "@/components/commun/auteurs/itemAuteur";

export default {
  name: "dialogueAuteur",
  props: {
    licence: { type: String },
    permissionModifier: { default: false, type: Boolean },
  },
  components: { itemAuteur },
  data: function () {
    return {
      dialogue: false,
    };
  },
};
</script>

<style></style>
