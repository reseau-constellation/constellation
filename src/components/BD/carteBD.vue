<template>
  <v-card
    class="mx-4 my-5 px-3 py-5 justify-start text-start"
    min-height="200px"
    max-width="300px"
    @click="$emit('click')"
  >
    <v-img
      :src="
        bd.logo || require('@/assets/undraw/undraw_Projections_re_1mrh.svg')
      "
      height="100px"
      contain
    ></v-img>

    <v-card-title
      >{{ couper(nom, 20) }}
      <v-spacer />
      <lien-orbite :lien="bd.id" />
    </v-card-title>
    <v-divider />
    <v-card-subtitle>{{ détails }}</v-card-subtitle>
    <v-card-text>
      <v-chip
        outlined
        label
        small
        class="me-1 my-1"
        @click.stop="
          licenceApprouvée ? ouvrirLien($t(`licences.${bd.licence}.lien`)) : ''
        "
      >
        <v-icon left small :color="licenceApprouvée ? 'secondary' : 'error'">
          {{ bd.licence ? "mdi-scale-balance" : "mdi-alert-outline" }}
        </v-icon>
        {{
          bd.licence && !licenceApprouvée
            ? bd.licence
            : $t(`licences.${bd.licence || "introuvable"}.nom`)
        }}
      </v-chip>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-show="épinglée !== null"
            icon
            v-bind="attrs"
            v-on="on"
            @click.stop="épinglée = !épinglée"
          >
            <v-icon>{{ épinglée ? "mdi-pin" : "mdi-pin-outline" }}</v-icon>
          </v-btn>
        </template>
        <span>Tooltip</span>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>

<script>
import { traduireNom, couper, ouvrirLien } from "@/utils";
import lienOrbite from "@/components/commun/lienOrbite";

import { licences } from "@/ipa/licences";

import { permissionÉcrire, obtNomsBD } from "@/ipa/bds";

export default {
  name: "carteBD",
  props: ["bd"],
  components: { lienOrbite },
  data: function() {
    return {
      épinglée: true,
      nomsBD: null,
      variables: []
    };
  },
  computed: {
    idBD: function() {
      return this.bd.id;
    },
    langues: function() {
      return [this.$i18n.locale, ...this.$i18n.fallbackLocale];
    },
    nom: function() {
      return this.nomsBD ? traduireNom(this.nomsBD, this.langues) : this.idBD;
    },
    détails: function() {
      return traduireNom(this.bd.détails, this.langues);
    },
    licenceApprouvée: function() {
      return this.bd.licence && licences.includes(this.bd.licence);
    }
  },
  methods: {
    couper,
    ouvrirLien
  },
  mounted: function() {
    obtNomsBD(this.idBD).then(noms => (this.nomsBD = noms));
  }
};
</script>

<style></style>
