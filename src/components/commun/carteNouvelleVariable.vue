<template>
  <v-card min-width="300">
    <v-card-title>
      {{ nom }}
      <v-spacer />
      <lien-orbite :lien="id" />
    </v-card-title>
    <v-card-subtitle>{{ détails }}</v-card-subtitle>
    <v-divider />
    <v-card-text>
      <p class="mb-0 text-overline">Unités</p>
      <p class="mb-0 text-overline">Noms</p>
      <v-list
        v-if="noms"
        dense
        class="overflow-y-auto"
        style="max-height: 200px;"
      >
        <v-list-item v-for="l in Object.keys(noms)" :key="l">
          <v-row>
            <v-col cols="4">
              {{ codeÀNomLangue(l) || l }}
            </v-col>
            <v-col cols="8" class="text--bold">
              {{ noms[l] }}
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { traduireNom } from "@/utils";
import { rubiChabäl as codeÀNomLangue } from "nuchabal";
import lienOrbite from "@/components/commun/lienOrbite";

export default {
  name: "carteVariable",
  props: ["id"],
  components: { lienOrbite },
  data: function () {
    return {
      noms: null,
      détails: null,
    };
  },
  computed: {
    langues: function () {
      return [this.$i18n.locale, ...this.$i18n.fallbackLocale];
    },
    nom: function () {
      return this.noms ? traduireNom(this.noms, this.langues) : this.id;
    },
  },
  methods: { codeÀNomLangue },
};
</script>

<style></style>
