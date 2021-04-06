<template>
  <v-container>
    <v-card flat>
      <v-card-subtitle>
        <v-breadcrumbs :items="petitPousset" class="pa-0">
          <template v-slot:divider>
            <v-icon>{{
              $vuetify.rtl ? "mdi-chevron-left" : "mdi-chevron-right"
            }}</v-icon>
          </template>
          <template v-slot:item="{ item }">
            <v-breadcrumbs-item
              :disabled="item.disabled"
              @click="$router.push(item.href)"
            >
              {{ item.text }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
      </v-card-subtitle>
      <v-img
        :src="
          tableau && tableau.logo
            ? tableau.logo
            : require('@/assets/undraw/undraw_Projections_re_1mrh.svg')
        "
        height="100px"
        contain
      ></v-img>
      <v-card-title v-if="this.tableau">
        {{ couper(nom, 45) }}
        <lien-orbite :lien="idBD" />
        <v-spacer />
        <lienTélécharger :lien="idBD" />
      </v-card-title>

      <v-card-text>
        <p class="mb-0 text-overline">Données</p>
        <v-divider />
        <v-data-table v-if="entête" :headers="entête" :items="données" dense>
          <template v-slot:no-data>
            {{ $t("tableau.vide") }}
          </template>
          <template
            v-for="c in entête"
            v-slot:[`header.${c.value}`]="{ header }"
          >
            <span :key="c.value" @click.stop>
              <v-icon x-small>mdi-information-outline</v-icon>
              {{ header.text }}
            </span>
          </template>
          <template v-for="c in entête" v-slot:[`item.${c.value}`]="{ item }">
            <span v-if="c.value === 'date'" :key="c.value">
              {{ new Date(item[c.value]).toLocaleDateString($i18n.locale) }}
            </span>
            <span v-else :key="c.value">
              {{ formatterChiffre(item[c.value]) }}
            </span>
          </template>
        </v-data-table>
        <v-skeleton-loader v-else type="image" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { obtTableau, obtDonnéesTableau, obtVarsTableau } from "@/ipa/tableaux";
import { traduireNom } from "@/utils";
import { couper } from "@/utils";

import lienOrbite from "@/components/commun/lienOrbite";
import lienTélécharger from "@/components/commun/lienTélécharger";
import mixinLangues from "@/mixins/langues";

export default {
  name: "visTableau",
  components: { lienOrbite, lienTélécharger },
  mixins: [mixinLangues],
  data: function() {
    return {
      tableau: null,
      données: [],
      entête: null
    };
  },
  computed: {
    nom: function() {
      const lngs = [this.$i18n.locale, ...this.$i18n.fallbackLocale];
      return traduireNom(this.tableau.nom, lngs);
    },
    idBD: function() {
      return this.$route.params.id;
    },
    idTableau: function() {
      return this.$route.params.idTableau;
    },
    petitPousset: function() {
      return [
        { text: "Données", href: "/bd" },
        { text: couper(this.idBD, 15), href: `/bd/visualiser/${this.idBD}` },
        {
          text: couper(this.tableau ? this.nom : this.idTableau, 15),
          disabled: true
        }
      ];
    }
  },
  methods: {
    couper
  },
  mounted: async function() {
    this.tableau = await obtTableau(this.idTableau);
    this.entête = [
      { text: "Date", value: "date" },
      { text: "Précipitation", value: "préc" },
      { text: "Température max", value: "tmax" },
      { text: "Température min", value: "tmin" }
    ]; // await obtVarsTableau(this.tableau.bdOrbite);
    this.données = await obtDonnéesTableau(this.tableau.bdOrbite);
  }
};
</script>

<style></style>
