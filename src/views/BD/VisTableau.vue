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
        <v-data-table v-if="entête" :headers="entête" :items="données">
          <template v-slot:no-data>
            {{ $t("tableau.vide") }}
          </template>
          <template v-for="c in entête" v-slot:[`item.${c.value}`]="{ item }">
            {{ formatterChiffre(item[c.value]) }}
          </template>
        </v-data-table>
        <v-skeleton-loader v-else type="image" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

import { obtTableau, obtDonnéesTableau, obtVarsTableau } from "@/ipa/tableaux";
import { traduireNom } from "@/utils";
import { couper } from "@/utils";
import { உரைக்கு } from "ennikkai";

import lienOrbite from "@/components/commun/lienOrbite";
import lienTélécharger from "@/components/commun/lienTélécharger";

export default {
  name: "visTableau",
  components: { lienOrbite, lienTélécharger },
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
      console.log(this.idBD, this.idTableau);
      return [
        { text: "Données", href: "/bd" },
        { text: couper(this.idBD, 15), href: `/bd/visualiser/${this.idBD}` },
        { text: couper(this.tableau ? this.nom : this.idTableau, 15) }
      ];
    },
    ...mapGetters({
      systèmeNumération: "paramètres/systèmeNumération"
    })
  },
  methods: {
    couper,
    formatterChiffre: function(n) {
      console.log(n, this.systèmeNumération);
      return உரைக்கு(n, this.systèmeNumération);
    }
  },
  mounted: async function() {
    this.tableau = await obtTableau(this.idTableau);
    this.entête = await obtVarsTableau(this.tableau.bdOrbite);
    this.données = await obtDonnéesTableau(this.tableau.bdOrbite);
  }
};
</script>

<style></style>
