<template>
  <v-card class="pa-5">
    <v-row>
      <v-col cols="4">
        <p class="px-0 text-overline">
          {{ $t("compte.onglets.thème.couleurs") }}
        </p>
        <v-switch
          v-model="thèmeNuit"
          inset
          :prepend-icon="
            thèmeNuit ? 'mdi-weather-night' : 'mdi-white-balance-sunny'
          "
          :label="$t('compte.options.thèmeNuit')"
        ></v-switch>
      </v-col>
      <v-col cols="4">
        <p class="px-0 text-overline">
          {{ $t("compte.onglets.thème.culture") }}
        </p>
        <v-radio-group
          :value="thèmeImages"
          :label="$t('compte.options.thèmeImages')"
          class="mt-0"
          @change="e => changerThèmeImages(e)"
        >
          <v-radio value="unDraw" label="unDraw" />
          <v-radio value="வவவ" label="வள்ளுவர் வள்ளலார் வட்டம்" />
        </v-radio-group>
      </v-col>
      <v-col cols="4">
        <p class="px-0 text-overline">
          {{ $t("compte.onglets.thème.langue") }}
        </p>
        <v-select
          :items="
            langues.map(l => {
              return { text: codeÀNomLangue(l) || l, value: l };
            })
          "
          :value="langue"
          :label="$t('compte.options.langue')"
          outlined
          dense
          hide-details
          prepend-icon="mdi-earth"
          class="pb-5"
          @change="changerLangue"
        >
          <template v-slot:item="{ item }">
            <op-langue
              :code="item.value"
              :sélectionnée="item.value === langue"
              :progrès="progrès(item.value)"
            />
          </template>
        </v-select>
        <v-select
          :value="systèmeNumération"
          :items="[{ text: $t('communs.auto'), value: null }, ...systèmesNum]"
          :label="$t('compte.options.numération')"
          outlined
          dense
          hide-details
          prepend-icon="mdi-abacus"
          class="py-5"
          @change="e => changerNumération(e)"
        >
          <template v-slot:item="{ on, item }">
            <v-list-item v-on="on">
              <v-list-item-content>
                {{ item.text || item }}
              </v-list-item-content>
              <v-list-item-action>
                {{
                  chifreÀTexte(
                    123.45,
                    item.value === null ? numLangue(langue) || "latin" : item
                  )
                }}
              </v-list-item-action>
            </v-list-item>
          </template>
        </v-select>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import opLangue from "@/components/commun/OpLangue";
import mixinLangues from "@/mixins/langues";
import {
  rubiChabäl as codeÀNomLangue,
  rajilanïkChabäl as numLangue
} from "nuchabal";
import { முறைமைகள் as systèmesNum, உரைக்கு as chifreÀTexte } from "ennikkai";

export default {
  name: "ongletThème",
  components: { opLangue },
  mixins: [mixinLangues],
  data: function() {
    return {
      thèmeNuit: this.$store.state.paramètres.thèmeNuit,
      systèmesNum
    };
  },
  watch: {
    thèmeNuit: function(val) {
      this.$store.commit("paramètres/changerThèmeNuit", { val });
      this.$vuetify.theme.dark = val;
    }
  },
  computed: {
    thèmeImages: function() {
      return this.$store.state.paramètres.thèmeImages;
    }
  },
  methods: {
    codeÀNomLangue,
    numLangue,
    chifreÀTexte,
    changerThèmeImages: function(thème) {
      this.$store.commit("paramètres/changerThèmeImage", { thème });
    }
  }
};
</script>

<style></style>
