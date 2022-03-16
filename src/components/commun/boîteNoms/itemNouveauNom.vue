<template>
  <v-list-item>
    <v-list-item-content>
      <v-row>
        <v-col cols="4">
          <v-select
            :label="$t('boîteNoms.etiquetteLangue')"
            v-model="langueNouveauNom"
            outlined
            dense
            hide-details
            offset-x
            :items="itemsLangues"
          ></v-select>
        </v-col>
        <v-col cols="8">
          <v-text-field
            v-model="nouveauNom"
            :label="$t('boîteNoms.etiquetteNom')"
            :dir="droiteÀGauche(langueNouveauNom) ? 'rtl' : 'ltr'"
            outlined
            dense
            hide-details
            @keydown.enter="ajouter(langueNouveauNom, nouveauNom)"
          />
        </v-col>
      </v-row>
    </v-list-item-content>

    <v-list-item-action>
      <v-btn
        icon
        color="success"
        :disabled="!langueNouveauNom || !nouveauNom"
        @click="ajouter(langueNouveauNom, nouveauNom)"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinLangues from "@/mixins/langues";

export default mixins(mixinLangues).extend({
  name: "itemNouveauNom",
  props: ["languesExistantes", "etiquetteLangue", "etiquetteNom"],
  mixins: [mixinLangues],
  data: function () {
    return {
      langueNouveauNom: null as null | string,
      nouveauNom: null as null | string,
    };
  },
  computed: {
    itemsLangues: function (): { text: string; value: string }[] {
      return this.langues
        .filter((lng) => {
          return !this.languesExistantes.includes(lng);
        })
        .map((code) => {
          return {
            text: this.nomDeLangue(code) || code,
            value: code,
          };
        });
    },
  },
  methods: {
    ajouter(langue: string, nom: string) {
      if (!langue || !nom) return; //Éviter de sauvegarder si tout n'est pas prêt
      this.$emit("sauvegarder", { langue, nom });
      this.langueNouveauNom = this.nouveauNom = "";
    },
  },
});
</script>

<style></style>
