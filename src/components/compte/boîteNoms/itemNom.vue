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
            color="amber"
            outlined
            dense
            hide-details
            :dir="droiteÀGauche(lng) ? 'rtl' : 'ltr'"
            @blur="sauvegarder"
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

<script>
import mixinLangues from "@/mixins/langues";

export default {
  name: "itemNom",
  props: ["langueOriginale", "nomOriginal"],
  mixins: [mixinLangues],
  data: function() {
    return {
      lng: "",
      nom: ""
    };
  },
  computed: {
    itemsLangues: function() {
      return this.languesNuchabal.map(code => {
        return {
          text: this.nomDeLangue(code),
          value: code
        };
      });
    }
  },
  methods: {
    sauvegarder: function() {
      if (this.lng === this.langueOriginale && this.nom === this.nomOriginal)
        return;
      if (this.lng !== this.langueOriginale) this.effacer();
      if (this.nom === "") {
        this.effacer();
      } else {
        this.$emit("sauvegarder", this.lng, this.nom);
      }
    },
    changerLangue: function() {
      this.$emit("changerLangue", this.langueOriginale, this.lng, this.nom);
    },
    effacer: function() {
      this.$emit("effacer", this.lng);
    }
  },
  mounted: function() {
    this.lng = this.langueOriginale;
    this.nom = this.nomOriginal;
  }
};
</script>

<style></style>
