<template>
  <v-list-item>
    <v-list-item-content>
      <v-row>
        <v-col cols="4">
          <v-autocomplete
            v-model="langueNouveauNom"
            :items="itemsLangues"
            :label="$t(etiquetteLangue)"
            outlined
            dense
            hide-details
            offset-x
            @keydown.enter="ajouter"
            @blur="ajouter"
          ></v-autocomplete>
        </v-col>
        <v-col cols="8">
          <v-text-field
            v-model="nouveauNom"
            :label="$t(etiquetteNom)"
            :dir="droiteÀGauche(langueNouveauNom) ? 'rtl' : 'ltr'"
            outlined
            dense
            hide-details
            @keydown.enter="ajouter"
            @blur="ajouter"
          />
        </v-col>
      </v-row>
    </v-list-item-content>

    <v-list-item-action>
      <v-btn
        icon
        color="success"
        :disabled="!prêt"
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
      langueNouveauNom: undefined as undefined | string,
      nouveauNom: undefined as undefined | string,
    };
  },
  computed: {
    prêt: function (): boolean {
      return Boolean(this.langueNouveauNom && this.nouveauNom);
    },
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
    ajouter() {
      if (!this.prêt) return; // Éviter de sauvegarder si tout n'est pas prêt
      this.sélectionnerLangue(this.langueNouveauNom!);
      this.$emit("sauvegarder", {
        langue: this.langueNouveauNom,
        nom: this.nouveauNom,
      });
      this.langueNouveauNom = this.nouveauNom = "";
    },
  },
  mounted: function () {
    console.log({récentes: this.languesRécentes})
    this.langueNouveauNom = this.languesRécentes.find(l=>!this.languesExistantes.includes(l))
  },
  beforeUpdate: function () {
    console.log({récentes: this.languesRécentes, langue: this.langueNouveauNom})
    if (!this.langueNouveauNom) this.langueNouveauNom = this.languesRécentes.find(l=>!this.languesExistantes.includes(l))
  }
});
</script>

<style></style>
