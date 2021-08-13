<template>
  <v-list-item>
    <v-list-item-content>
      <v-row>
        <v-col cols="4">
          <v-select
            v-model="lng"
            outlined
            dense
            hide-details
            :items="itemsLangues"
            @change="changerLangue"
          ></v-select>
        </v-col>
        <v-col cols="8">
          <v-text-field
            v-model="nom"
            outlined
            dense
            hide-details
            :dir="droiteÀGauche(lng) ? 'rtl' : 'ltr'"
            @blur="sauvegarder"
            @keydown.enter="sauvegarder"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-list-item-content>

    <v-list-item-action>
      <v-btn icon color="error">
        <v-icon @click="effacer">mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinLangues from "@/mixins/langues";

export default mixins(mixinLangues).extend({
  name: "itemNom",
  props: ["langueOriginaleNom", "nomOriginal"],
  mixins: [mixinLangues],
  data: function () {
    return {
      lng: "",
      nom: "",
    };
  },
  computed: {
    itemsLangues: function (): { text: string; value: string }[] {
      return this.langues.map((code) => {
        return {
          text: this.nomDeLangue(code) || code,
          value: code,
        };
      });
    },
  },
  methods: {
    sauvegarder: function () {
      if (this.lng === this.langueOriginaleNom && this.nom === this.nomOriginal)
        return;
      if (this.lng !== this.langueOriginaleNom) this.effacer();
      if (this.nom === "") {
        this.effacer();
      } else {
        this.$emit("sauvegarder", { langue: this.lng, nom: this.nom });
      }
    },
    changerLangue: function () {
      this.$emit("changerLangue", {
        langueOriginale: this.langueOriginaleNom,
        langue: this.lng,
        nom: this.nom,
      });
    },
    effacer: function () {
      this.$emit("effacer", { langue: this.lng });
    },
  },
  mounted: function () {
    this.lng = this.langueOriginaleNom;
    this.nom = this.nomOriginal;
  },
});
</script>

<style></style>
