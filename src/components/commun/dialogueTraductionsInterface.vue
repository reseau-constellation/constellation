<template>
  <v-dialog v-model="dialogue">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline mb-3">
        Traduire Constellation
        <v-spacer />
        <v-btn icon>
          <v-icon>mdi-download</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle>
        <v-icon left small>mdi-information-outline</v-icon>
        Les traductions que vous contribuez seront incluses dans les distributions de Constellation sous la licence GNU GPL Affero 3,0.
      </v-card-subtitle>

      <v-card outlined>
        <div class="d-flex flex-wrap">

          <v-card flat width="200" class="ma-3">
            <v-select
              :items="
                langues.map((l) => {
                  return { text: codeÀNomLangue(l) || l, value: l };
                })
              "
              :value="langueSource"
              class="mx-2 my-2"
              outlined
              dense hide-details
              label="Langue source"
              @change="changerLangueSource"
            >
              <template v-slot:item="{ item }">
                <op-langue
                  :code="item.value"
                  :sélectionnée="item.value === langueSource"
                  :progrès="progrès(item.value)"
                />
              </template>
            </v-select>
          </v-card>
          <v-card flat width="200" class="ma-3">
            <v-select
              :items="
                langues.map((l) => {
                  return { text: codeÀNomLangue(l) || l, value: l };
                })
              "
              :value="langueCible"
              class="mx-2 my-2"
              outlined
              dense
              hide-details
              label="Langue cible"
              @change="changerLangueCible"
            >
              <template v-slot:item="{ item }">
                <op-langue
                  :code="item.value"
                  :sélectionnée="item.value === langueCible"
                  :progrès="progrès(item.value)"
                />
              </template>
            </v-select>
          </v-card>
        </div>
      </v-card>

      <v-card-text class="mt-3">
        <v-row>
          <v-col cols="6">
            <v-list style="max-height: 500px" class="overflow-y-auto">
              <v-list-item v-for="clef in clefsMessages()" :key="clef" @click="()=>sélectionner(clef)">
                <v-list-item-content>
                  <v-card outlined max-width="300" class="mx-4">
                    <v-card-text class="text--primary">
                      {{ traduireClef(clef, [langueSource, langueOriginale]) || clef }}
                    </v-card-text>
                    <v-divider />
                    <v-card-actions class="px-4 text--secondary">
                      <v-icon left small>mdi-xml</v-icon>
                      {{couper(clef, 30)}}
                    </v-card-actions>
                  </v-card>
                  <v-card outlined max-width="300" class="mx-4">
                    <v-card-text :class="`text--${traduireClef(clef, [langueCible]) ? 'primary' : 'disabled'}`">
                      {{ traduireClef(clef, [langueCible]) || "[Aucune traduction]"}}
                    </v-card-text>
                    <v-divider />
                    <v-card-actions class="px-4 text--secondary">
                      <v-icon left small>mdi-xml</v-icon>
                      {{couper(clef, 30)}}
                    </v-card-actions>
                  </v-card>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col cols="6">
            <v-card outlined>
              <v-card-title>
                {{ clefSélectionnée ? "Proposez un traduction" : "Sélectionnez un item de la liste à gauche" }}
              </v-card-title>
              <v-card-text>
                <v-card flat>
                  <v-textarea :disabled="!clefSélectionnée" outlined no-resize height="100" :hint="clefSélectionnée" persistent-hint>
                  </v-textarea>
                  <v-card-actions>
                    <v-btn text :disabled="!clefSélectionnée"><v-icon left>mdi-content-copy</v-icon> Copier originale </v-btn>
                    <v-spacer />
                    <v-btn text :disabled="!clefSélectionnée" @click="clefSélectionnée = null"> Annuler </v-btn>
                    <v-btn text :disabled="!clefSélectionnée" outlined color="primary" @click="sauvegarderTraduction"> Sauvegarder </v-btn>
                  </v-card-actions>
                </v-card>
                <v-divider />
                <v-card v-if="clefSélectionnée" flat>
                  <v-card-title> Suggestions de la communauté ({{ 10 }})</v-card-title>
                  <v-card-text>
                    <v-list style="max-height: 200px" class="overflow-y-auto">
                      <v-list-item @click="codeÀNomLangue" v-for="i in 10" :key="i">
                        <v-list-item-avatar>
                          <avatar-profil />
                        </v-list-item-avatar>

                        <v-list-item-content>
                          <v-list-item-title> Nom de l'utilisatrice </v-list-item-title>
                          <v-divider />
                          <span class="text--secondary">{{ traduireClef(clefSélectionnée, [langueCible]) }}</span>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

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
import {
  rubiChabäl as codeÀNomLangue
} from "nuchabal";

import { couper } from "@/utils";
import avatarProfil from "@/components/commun/avatarProfil";
import opLangue from "@/components/commun/OpLangue";
import mixinLangues from "@/mixins/langues";

const ID_MOTCLEF_TRAD = "/orbitdb/zdpuAsiATt21PFpiHj8qLX7X7kN3bgozZmhEVswGncZYVHidX/7e0cde32-7fee-487c-ad6e-4247f627488e"
const ID_MOTCLEF_TRADS_CONSTELLATION = "/orbitdb/zdpuAuk6kRoPQKfwuWi5qMYMSyUMeiTjtcFE23AaHy9MQsXcs/93c94a56-f681-4512-8c4b-5c213119ab4b"

export default {
  name: "dialogueTraductionsInterface",
  mixins: [mixinLangues],
  components: {opLangue, avatarProfil},
  data: function () {
    return {
      dialogue: false,
      langueSource: null,
      langueCible: null,
      clefSélectionnée: null
    };
  },
  methods: {
    couper,
    codeÀNomLangue,
    changerLangueCible: function(langue) {
      this.langueCible = langue
    },
    changerLangueSource: function(langue) {
      this.langueSource = langue
    },
    sélectionner: function(clef) {
      this.clefSélectionnée = clef
    }
  },
  mounted: function() {
    this.langueSource = this.langueOriginale;
    this.langueCible = this.langue
  }
};
</script>

<style></style>
