<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline"> {{ $t("dialogueAuteurs.entête") }}
      </v-card-title>
      <v-divider />

      <v-card-text>
        <v-list>
          <v-skeleton-loader v-if="auteurs === null" type="paragraph@3" />
          <span v-else>
            <dialogue-nouvel-auteur
              v-if="permissionModerateur"
              :permissionModerateur="true || permissionModerateur"
              :idBd="idBd"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-list-item v-bind="attrs" v-on="on">
                  <v-list-item-avatar>
                    <v-icon>mdi-plus</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                  {{ $t("dialogueAuteurs.அங்கீகாரம்") }}
                  </v-list-item-content>
                </v-list-item>
              </template>
            </dialogue-nouvel-auteur>

            <item-auteur
              v-for="auteur in auteurs"
              :key="auteur.idBdRacine"
              :id="auteur.idBdRacine"
              :mod="auteur.rôle === MODÉRATEUR"
              :accepté="auteur.accepté"
            />
          </span>
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

<script lang="ts">
import Vue from "vue";
import { MODÉRATEUR } from "@constl/ipa/lib/accès/consts";

import itemAuteur from "@/components/BD/auteurs/itemAuteur.vue";
import dialogueNouvelAuteur from "@/components/BD/auteurs/dialogueNouvelAuteur.vue";

export default Vue.extend({
  name: "dialogueAuteurs",
  props: ["idBd", "auteurs", "permissionModerateur"],
  components: { itemAuteur, dialogueNouvelAuteur },
  data: function () {
    return {
      dialogue: false,
      MODÉRATEUR,
    };
  },
});
</script>

<style></style>
