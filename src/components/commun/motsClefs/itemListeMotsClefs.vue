<template>
  <v-list-item @click="$emit('selectionne')">
    <v-list-item-content>
      {{ couper(nom, 30) }}
    </v-list-item-content>
    <v-list-item-action-text v-if="permissionÉcrire">
      <lien-orbite :lien="id" />
      <v-menu
        v-if="permissionÉcrire"
        offset-x
        :close-on-content-click="false"
        transition="slide-y-transition"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-on="on"
            v-bind="attrs"
            icon small
          >
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </template>
        <boîteNoms
          :noms="noms"
          titre="motsClefs.jeton.titreBoîteNoms"
          sousTitre="motsClefs.jeton.sousTitreBoîteNoms"
          @sauvegarder="sauvegarderNom"
          @changerLangue="changerLangueNom"
          @effacer="effacerNom"
        />
      </v-menu>
      <v-btn icon small v-if="permissionÉcrire" color="error"
        @click.stop="effacerMotClef"
      >
        <v-icon small>mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action-text>
  </v-list-item>
</template>

<script>
import { couper, traduireNom } from "@/utils";
import boîteNoms from "@/components/commun/boîteNoms/boîte";
import lienOrbite from "@/components/commun/lienOrbite";

import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default {
  name: "itemListeMotsClefs",
  props: ["id"],
  mixins: [mixinIPA, mixinLangues],
  components: { boîteNoms, lienOrbite },
  data: function () {
    return {
      noms: {},
      permissionÉcrire: false,
    };
  },
  computed: {
    nom: function () {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id.slice(9);
    },
  },
  methods: {
    couper,
    sauvegarderNom({ langue, nom }) {
      this.$ipa.motsClefs.sauvegarderNomMotClef(this.id, langue, nom);
    },
    changerLangueNom({ langueOriginale, langue, nom }) {
      this.$ipa.motsClefs.effacerNomMotClef(this.id, langueOriginale);
      this.$ipa.motsClefs.sauvegarderNomMotClef(this.id, langue, nom);
    },
    effacerNom({ langue }) {
      this.$ipa.motsClefs.effacerNomMotClef(this.id, langue);
    },
    effacerMotClef() {
      this.$ipa.motsClefs.effacerMotClef(this.id);
    },
    initialiserSuivi: async function () {
      this.permissionÉcrire = await this.$ipa.permissionÉcrire(this.id);

      const oublierNoms = await this.$ipa.motsClefs.suivreNomsMotClef(
        this.id,
        (noms) => {
          this.noms = noms;
        }
      );
      this.suivre([oublierNoms]);
    },
  },
};
</script>

<style></style>
