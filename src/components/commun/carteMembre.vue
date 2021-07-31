<template>
  <v-card v-show="actif" width="300" class="ma-2 text-start">
    <v-card-title>
      <avatar-profil :id="id" :vuIlyA="vuIlyA" />
      {{ nom ? couper(nom, 17) : "Incognito" }}
      <v-spacer />
      <lien-orbite :lien="id" />
    </v-card-title>
    <v-divider />
    <v-card-text class="text-left">
      <span v-if="courriel">
        <p class="mb-0 text-overline">Contact</p>
        <v-chip label outlined small>
          <v-icon left small>mdi-email</v-icon>
          {{ couper(courriel, 50) }}
        </v-chip>
      </span>
      <p class="mb-0 text-overline">Bases de données</p>
      <jeton-bd v-for="bd in bds.slice(0, N_MAX_LISTE)" :key="bd" :id="bd" />
      <v-chip
        v-if="bds.length > N_MAX_LISTE"
        class="me-1 mb-1"
        label
        outlined
        small
      >
        + {{ bds.length - N_MAX_LISTE }} autre(s)
      </v-chip>
      <v-chip v-if="!bds.length" label outlined small disabled>
        Aucune BD
      </v-chip>

      <p class="mb-0 text-overline">Projets</p>
      <jeton-bd v-for="projet in projets" :key="projet" :id="projet" />
      <v-chip v-if="!projets.length" label outlined small disabled>
        Aucun projet
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script>
import { traduireNom, couper } from "@/utils";
import lienOrbite from "@/components/commun/lienOrbite";
import jetonBd from "@/components/commun/jetonBd";
import avatarProfil from "@/components/commun/avatarProfil";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default {
  name: "carteMembre",
  props: ["id", "vuIlyA"],
  mixins: [mixinLangues, mixinIPA],
  components: { lienOrbite, jetonBd, avatarProfil },
  data: function () {
    return {
      noms: {},
      courriel: null,
      bds: [],
      projets: [],

      N_MAX_LISTE: 4,
    };
  },
  computed: {
    nom: function () {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : null;
    },
    moiMême: function () {
      return this.id === this.$ipa.bdRacine.id;
    },
    actif: function () {
      return (
        Object.keys(this.noms).length ||
        this.courriel ||
        this.bds.length ||
        this.projets.length
      );
    },
  },
  methods: {
    couper,
    initialiserSuivi: async function () {
      const oublierNoms = await this.$ipa.réseau.suivreNomsMembre(
        this.id,
        (noms) => {
          this.noms = noms;
        }
      );
      const oublierCourriel = await this.$ipa.réseau.suivreCourrielMembre(
        this.id,
        (courriel) => {
          this.courriel = courriel;
        }
      );
      const oublierBds = await this.$ipa.réseau.suivreBdsMembre(
        this.id,
        (bds) => {
          this.bds = bds;
        }
      );
      const oublierProjets = await this.$ipa.réseau.suivreProjetsMembre(
        this.id,
        (projets) => {
          this.projets = projets;
        }
      );
      this.suivre([oublierNoms, oublierCourriel, oublierBds, oublierProjets]);
    },
  },
};
</script>

<style></style>
