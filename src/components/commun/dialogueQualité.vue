<template>
  <v-dialog v-model="dialogue" scrollable max-width="600">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline mb-3">
        <v-progress-circular
          class="me-3"
          :rotate="270"
          :width="4"
          :size="25"
          :indeterminate="!score"
          :value="scoreTitre ? scoreTitre * 100 : 0"
          :color="
            scoreTitre ? couleurScore(scoreTitre).couleur : 'grey lighten-2'
          "
        />
        {{ $t(titre) }}
        <v-spacer />
        <v-btn icon @click="dialogue = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle v-if="permissionModifier">
        {{ $t(sousTitre) }}
      </v-card-subtitle>
      <v-divider />

      <v-card-text class="mt-3">
        <v-skeleton-loader v-if="!score" type="paragraph@3" />
        <v-window v-else v-model="étape">
          <v-window-item :value="1">
            <v-list>
              <v-list-item
                v-for="[c, v] in Object.entries(score).filter(
                  (x) => x[0] !== 'total'
                )"
                :key="c"
                @click="avancer(c)"
              >
                <v-list-item-avatar>
                  <v-progress-circular
                    :rotate="270"
                    :width="5"
                    :value="v ? v * 100 : 0"
                    :color="couleurScore(v).couleur"
                  >
                    {{
                      typeof v === "number" && !isNaN(v)
                        ? Math.round(v * 100)
                        : ""
                    }}
                  </v-progress-circular>
                </v-list-item-avatar>
                <v-list-item-content>
                  {{ $t(`qualité.titres.${c}`) }}
                  <span
                    :style="`color:${couleurScore(v).couleur}`"
                    class="font-weight-bold"
                  >
                    {{ couleurScore(v).note }}
                  </span>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon>{{
                    $vuetify.rtl ? "mdi-chevron-left" : "mdi-chevron-right"
                  }}</v-icon>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-window-item>
          <v-window-item :value="2"> </v-window-item>
          <v-window-item :value="3"> </v-window-item>
          <v-window-item :value="4"> </v-window-item>
        </v-window>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-btn
          v-show="étape !== 1"
          color="secondary"
          text
          outlined
          @click="étape = 1"
        >
          <v-icon left>{{
            $vuetify.rtl ? "mdi-chevron-right" : "mdi-chevron-left"
          }}</v-icon>
          {{ $t("communs.retour") }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="dialogue = false">
          {{ $t("communs.fermer") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinLangues from "@/mixins/langues";
import { couleurScore } from "@/utils";

export default mixins(mixinLangues).extend({
  name: "dialogueQualité",
  props: ["score", "permissionModifier"],
  mixins: [mixinLangues],
  data: function () {
    return {
      dialogue: false,

      étape: 1,
    };
  },
  computed: {
    titre: function (): string {
      switch (this.étape) {
        case 1: {
          return "qualité.titre";
        }
        case 2: {
          return "qualité.titres.accès";
        }
        case 3: {
          return "qualité.titres.couverture";
        }
        case 4: {
          return "qualité.titres.valide";
        }
        default:
          return "";
      }
    },
    sousTitre: function () {
      switch (this.étape) {
        case 1: {
          return "qualité.sousTitre";
        }
        case 2: {
          return "qualité.sousTitres.accès";
        }
        case 3: {
          return "qualité.sousTitres.couverture";
        }
        case 4: {
          return "qualité.sousTitres.valide";
        }
        default:
          return "";
      }
    },
    scoreTitre: function (): number | undefined {
      switch (this.étape) {
        case 1: {
          return this.score ? this.score.total : 0;
        }
        case 2: {
          return this.score ? this.score.accès : 0;
        }
        case 3: {
          return this.score ? this.score.couverture : 0;
        }
        case 4: {
          return this.score ? this.score.valide : 0;
        }
        default:
          return undefined;
      }
    },
  },
  methods: {
    couleurScore,
    avancer: function (section: "accès" | "couverture" | "valide") {
      const pages: { accès: number; couverture: number; valide: number } = {
        accès: 2,
        couverture: 3,
        valide: 4,
      };
      this.étape = pages[section];
    },
  },
});
</script>

<style></style>
