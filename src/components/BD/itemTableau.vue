<template>
  <v-list-item @click="$emit('click')">
    <v-list-item-title>{{ tableau ? nom : id }}</v-list-item-title>
    <v-list-item-action>
      <v-btn icon color="error" @click.stop="effacer">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import { nomBD } from "@/ipa/utils";
import { obtTableau } from "@/ipa/tableaux";
export default {
  name: "itemTableau",
  props: ["id"],
  data: function() {
    return {
      tableau: null
    };
  },
  computed: {
    nom: function() {
      const lngs = [this.$i18n.locale, ...this.$i18n.fallbackLocale];
      return nomBD(this.tableau, lngs);
    }
  },
  mounted: function() {
    obtTableau(this.id).then(t => {
      this.tableau = t;
    });
  }
};
</script>

<style></style>
