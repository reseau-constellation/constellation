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
          <v-btn v-on="on" v-bind="attrs" icon small>
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
      <v-btn
        icon
        small
        v-if="permissionÉcrire"
        color="error"
        @click.stop="effacerMotClef"
      >
        <v-icon small>mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action-text>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { couper, traduireNom } from "@/utils";
import boîteNoms from "@/components/commun/boîteNoms/boîte.vue";
import lienOrbite from "@/components/commun/lienOrbite.vue";

import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemListeMotsClefs",
  props: ["id"],
  mixins: [mixinIPA, mixinLangues],
  components: { boîteNoms, lienOrbite },
  data: function () {
    return {
      noms: {} as { [key: string]: string },
      permissionÉcrire: false,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id.slice(9);
    },
  },
  methods: {
    couper,
    sauvegarderNom({ langue, nom }: { langue: string; nom: string }) {
      this.$ipa.motsClefs!.sauvegarderNomMotClef(this.id, langue, nom);
    },
    changerLangueNom({
      langueOriginale,
      langue,
      nom,
    }: {
      langueOriginale: string;
      langue: string;
      nom: string;
    }) {
      this.$ipa.motsClefs!.effacerNomMotClef(this.id, langueOriginale);
      this.$ipa.motsClefs!.sauvegarderNomMotClef(this.id, langue, nom);
    },
    effacerNom({ langue }: { langue: string }) {
      this.$ipa.motsClefs!.effacerNomMotClef(this.id, langue);
    },
    effacerMotClef() {
      this.$ipa.motsClefs!.effacerMotClef(this.id);
    },
    initialiserSuivi: async function () {
      const oublierPermissionÉcrire = await this.$ipa.suivrePermissionÉcrire(
        this.id,
        (permission) => (this.permissionÉcrire = permission)
      );

      const oublierNoms = await this.$ipa.motsClefs!.suivreNomsMotClef(
        this.id,
        (noms) => {
          this.noms = noms;
        }
      );
      this.suivre([oublierPermissionÉcrire, oublierNoms]);
    },
  },
});
</script>

<style></style>
