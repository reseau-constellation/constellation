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
          <v-list-item @click="autoriserAuteur">
            <v-list-item-avatar>
              <v-icon>mdi-plus</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              Autoriser un autre auteur
            </v-list-item-content>
          </v-list-item>
          <item-auteur v-for="auteur in auteurs" :key="auteur.idBdRacine" :id="auteur.idBdRacine" :mod="auteur.rôle===MODÉRATEUR" :accepté="auteur.accepté"/>
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
import itemAuteur from "@/components/BD/auteurs/itemAuteur";
import { MODÉRATEUR } from "@/ipa/accès/consts";

export default {
  name: "dialogueAuteur",
  props: ["auteurs", "permissionModifier"],
  components: { itemAuteur },
  data: function () {
    return {
      dialogue: false,
      MODÉRATEUR,
    };
  },
};
</script>

<style></style>
