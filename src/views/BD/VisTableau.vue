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
        :src="logo || require('@/assets/undraw/undraw_Projections_re_1mrh.svg')"
        height="100px"
        contain
      ></v-img>
      <v-card-title>
        {{ couper(nom, 45) }}
        <span v-if="permissionÉcrire">
          <v-menu
            offset-x
            :close-on-content-click="false"
            transition="slide-y-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-on="on" v-bind="attrs">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <boîteNoms
              :noms="nomsTableau"
              sousTitre="bd.vis.boîteNoms.sousTitre"
              @sauvegarder="sauvegarderNom"
              @changerLangue="changerLangueNom"
              @effacer="effacerNom"
            />
          </v-menu>
        </span>
        <lien-orbite :lien="idBd" />

        <v-spacer />
        <lienTélécharger :lien="idBd" />
      </v-card-title>
      <v-divider />

      <v-card-text>
        <tableau :idTableau="idTableau" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { traduireNom, couper } from "@/utils";

import tableau from "@/components/tableaux/tableau.vue";

import boîteNoms from "@/components/commun/boîteNoms/boîte.vue";
import lienOrbite from "@/components/commun/lienOrbite.vue";
import lienTélécharger from "@/components/commun/lienTélécharger.vue";

import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "visTableau",
  components: {
    lienOrbite,
    lienTélécharger,
    boîteNoms,
    tableau,
  },
  mixins: [mixinLangues, mixinIPA],
  data: function () {
    return {
      permissionÉcrire: false,
      nomsTableau: {},
      nomsBD: {},
      logo: null,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.nomsTableau).length
        ? traduireNom(this.nomsTableau, this.languesPréférées)
        : this.idTableau;
    },
    nomBD: function (): string {
      return Object.keys(this.nomsBD).length
        ? traduireNom(this.nomsBD, this.languesPréférées)
        : this.idBd;
    },
    idBd: function () {
      return decodeURIComponent(this.$route.params.id);
    },
    idTableau: function () {
      return decodeURIComponent(this.$route.params.idTableau);
    },
    petitPousset: function (): {
      text: string;
      href?: string;
      disabled?: boolean;
    }[] {
      return [
        { text: "Données", href: "/bd" },
        {
          text: couper(this.nomBD, 15),
          href: `/bd/visualiser/${encodeURIComponent(this.idBd)}`,
        },
        {
          text: couper(this.nom, 15),
          disabled: true,
        },
      ];
    },
  },
  methods: {
    couper,
    sauvegarderNom({ langue, nom }: { langue: string; nom: string }) {
      this.$ipa.tableaux!.sauvegarderNomTableau(this.idTableau, langue, nom);
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
      this.$ipa.tableaux!.effacerNomTableau(this.idTableau, langueOriginale);
      this.$ipa.tableaux!.sauvegarderNomTableau(this.idTableau, langue, nom);
    },
    effacerNom({ langue }: { langue: string }) {
      this.$ipa.tableaux!.effacerNomTableau(this.idTableau, langue);
    },
    initialiserSuivi: async function () {
      const oublierPermissionÉcrire = await this.$ipa.suivrePermissionÉcrire(
        this.idTableau,
        (permission) => (this.permissionÉcrire = permission)
      );

      const oublierNoms = await this.$ipa.tableaux!.suivreNomsTableau(
        this.idTableau,
        (noms) => {
          this.nomsTableau = noms;
        }
      );

      const oublierNomsBD = await this.$ipa.bds!.suivreNomsBd(
        this.idBd,
        (noms) => {
          this.nomsBD = noms;
        }
      );

      this.suivre([oublierPermissionÉcrire, oublierNoms, oublierNomsBD]);
    },
  },
});
</script>

<style></style>
