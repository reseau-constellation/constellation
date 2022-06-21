<template>
  <v-dialog v-model="dialogue" scrollable max-width="700">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline">
        {{ $t("dialogueNouveauMotClef.motclef") }}
      </v-card-title>
      <v-divider />

      <v-card-text class="mt-3">
        <p class="grey--text text--darken-1">
          {{ $t("dialogueNouveauMotClef.sousTitre") }}
        </p>
        <boîteNoms
          :noms="noms"
          sousTitre="dialogueNouveauMotClef.தேர்ந்தெடுக்க"
          @sauvegarder="sauvegarderNom"
          @changerLangue="changerLangueNom"
          @effacer="effacerNom"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-on="on"
              v-bind="attrs"
              flat
              dense
              outlined
              :readonly="true"
              :value="nom"
              :label="$t('dialogueNouvelleVariable.nom')"
            />
          </template>
        </boîteNoms>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="fermer">
          {{ $t("communs.annuler") }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!Object.keys(noms).length"
          depressed
          @click="creerMotClef"
        >
          {{ $t("communs.sauvegarder") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";
import mixinLangues from "@/mixins/langues";

import { traduireNom } from "@/utils";
import boîteNoms from "@/components/commun/boîteNoms/boîte.vue";

export default mixins(mixinLangues).extend({
  name: "dialogueNouveauMotClef",
  components: { boîteNoms },
  mixins: [mixinLangues],
  data: function () {
    return {
      noms: {} as { [key: string]: string },
      dialogue: false,
    };
  },
  computed: {
    nom: function (): string | undefined {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : undefined;
    },
  },
  methods: {
    sauvegarderNom: function ({
      langue,
      nom,
    }: {
      langue: string;
      nom: string;
    }) {
      this.noms = { ...this.noms, [langue]: nom };
    },
    effacerNom: function ({ langue }: { langue: string }) {
      this.noms = Object.fromEntries(
        Object.keys(this.noms)
          .filter((x) => x !== langue)
          .map((x) => [x, this.noms[x]])
      );
    },
    changerLangueNom: function ({
      langueOriginale,
      langue,
      nom,
    }: {
      langueOriginale: string;
      langue: string;
      nom: string;
    }) {
      this.effacerNom({ langue: langueOriginale });
      this.sauvegarderNom({ langue, nom });
    },
    creerMotClef: async function () {
      const idMotClef = await this.$ipa.motsClefs!.créerMotClef();
      await this.$ipa.motsClefs!.ajouterNomsMotClef({
        id: idMotClef,
        noms: this.noms,
      });
      this.$emit("cree", { id: idMotClef });
      this.fermer();
    },
    fermer: function () {
      this.dialogue = false;
      this.noms = {};
    },
  },
});
</script>

<style></style>
