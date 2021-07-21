<template>
  <v-dialog v-model="dialogue" scrollable max-width="500">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline"> Nouveau mot clef </v-card-title>
      <v-divider />

      <v-card-text class="mt-3">
        <span class="grey--text text--darken-1">
          Choisissez un nom pour votre mot clef
        </span>
        <item-nouveau-nom
          :languesExistantes="Object.keys(noms)"
          etiquetteNom="Description"
          etiquetteLangue="Langue"
          @sauvegarder="sauvegarderNom"
        />
        <v-divider v-show="Object.keys(noms).length" />
        <v-list style="max-height: 150px" class="overflow-y-auto">
          <item-nom
            v-for="(nom, langue) in noms"
            :key="langue"
            :nomOriginal="nom"
            :langueOriginale="langue"
            @sauvegarder="sauvegarderNom"
            @effacer="effacerNom"
            @changerLangue="changerLangueNom"
          />
        </v-list>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="dialogue = false">
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

<script>
import itemNom from "@/components/commun/boîteNoms/itemNom";
import itemNouveauNom from "@/components/commun/boîteNoms/itemNouveauNom";

export default {
  name: "dialogueNouveauMotClef",
  components: { itemNom, itemNouveauNom },
  data: function () {
    return {
      noms: {},
      dialogue: false,
    };
  },
  methods: {
    sauvegarderNom: function ({ langue, nom }) {
      this.noms = { ...this.noms, [langue]: nom };
    },
    effacerNom: function ({ langue }) {
      this.noms = Object.fromEntries(
        Object.keys(this.noms)
          .filter((x) => x !== langue)
          .map((x) => [x, this.noms[x]])
      );
    },
    changerLangueNom: function ({ langueOriginale, langue, nom }) {
      this.effacerNom(langueOriginale);
      this.sauvegarderNom(langue, nom);
    },
    creerMotClef: async function () {
      const idMotClef = await this.$ipa.motsClefs.créerMotClef();
      await this.$ipa.motsClefs.ajouterNomsMotClef(idMotClef, this.noms);
      this.$emit("cree", { id: idMotClef });
      this.dialogue = false;
    },
  },
};
</script>

<style></style>
