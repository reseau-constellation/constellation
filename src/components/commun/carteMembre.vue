<template>
  <v-card max-width="300">
    <v-card-title>
      <v-list-item-avatar>
        <img :src="imageProfil" />
      </v-list-item-avatar>
      {{ nom || "Incognito" }}
      <v-spacer />
      <lien-orbite :lien="id" />
    </v-card-title>
    <v-divider />
    <v-card-text class="text-left">
      <span v-if="courriel">
        <p class="mb-0 text-overline">
          Contact
        </p>
        <v-chip label outlined small>
          <v-icon left small>mdi-email</v-icon>
          {{ couper(courriel, 50 ) }}
        </v-chip>
      </span>
      <p class="mb-0 text-overline">
        Bases de données
      </p>
      <jeton-bd v-for="bd in bds" :key="bd" :id="bd" />
      <v-chip v-if="!bds.length" label outlined small disabled>
        Aucune BD
      </v-chip>

      <p class="mb-0 text-overline">
        Projets
      </p>
      <jeton-bd v-for="projet in projets" :key="projet" :id="projet" />
      <v-chip v-if="!projets.length" label outlined small disabled>
        Aucun projet
      </v-chip>

    </v-card-text>
  </v-card>
</template>

<script>
import { traduireNom, icôneCatégorieVariable, catégoriesVariable, couper } from "@/utils";
import lienOrbite from "@/components/commun/lienOrbite";
import jetonBd from "@/components/commun/jetonBd";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";
import mixinImage from "@/mixins/images";

export default {
  name: "carteMembre",
  props: ["id"],
  mixins: [mixinLangues, mixinIPA, mixinImage],
  components: { lienOrbite, jetonBd },
  data: function() {
    return {
      noms: {},
      imageCompte: null,
      courriel: null,
      bds: [],
      projets: []
    };
  },
  computed: {
    nom: function() {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : null;
    },
    imageProfil: function() {
      if (this.imageCompte) {
        return this.imageCompte;
      }
      const options = [this.image("profilFemme"), this.image("profilHomme")];
      // Dans le doute, on garde ça équitable :)
      return options[Math.floor(Math.random() * options.length)];
    }
  },
  methods: {
    couper,
    sauvegarderCategorie: async function(catégorie) {
      await this.$ipa.variables.sauvegarderCatégorieVariable(this.id, catégorie);
    },
    initialiserSuivi: async function() {
      const oublierNoms = await this.$ipa.réseau.suivreNomsMembre(
        this.id,
        noms => {
          this.noms = noms;
        }
      );
      const oublierCourriel = await this.$ipa.réseau.suivreCourrielMembre(
        this.id,
        courriel => {
          this.courriel = courriel;
        }
      );
      const oublierBds = await this.$ipa.réseau.suivreBdsMembre(
        this.id,
        bds => {
          this.bds = bds;
        }
      );
      const oublierImage = await this.$ipa.réseau.suivreImageMembre(
        this.id,
        image => {
          if (image) {
            const url = URL.createObjectURL(
              new Blob([image.buffer], { type: "image/png" })
            );
            this.imageCompte = url;
          } else {
            this.imageCompte = null;
          }
        }
      );

      this.suivre([oublierNoms, oublierImage, oublierCourriel, oublierBds]);
    }
  }
};
</script>

<style></style>
