<template>
  <v-list-item>
    <v-list-item-avatar>
      <avatar-profil :id="idAuteur" />
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title> {{ couper(nom, 20) }} </v-list-item-title>
      <v-list-item-subtitle> {{ date }} </v-list-item-subtitle>
      <v-divider />
      <span class="text--secondary">{{ traduction }}</span>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";
import { couper, traduireNom } from "@/utils";

import { suggestionTrad, ID_VAR_TRADUCTION, ID_VAR_DATE } from "./types";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemTradCommunauté",
  props: {
    suggestion: {
      type: Object as () => suggestionTrad,
    },
  },
  data: function () {
    return {
      nomsAuteur: {} as { [key: string]: string },
    };
  },
  computed: {
    idAuteur: function (): string {
      return this.suggestion.idBdAuteur;
    },
    traduction: function (): string {
      return this.suggestion.élément.données[ID_VAR_TRADUCTION];
    },
    date: function (): string {
      const date = this.suggestion.élément.données[ID_VAR_DATE];
      return this.formatterDate(date);
    },
    nom: function (): string {
      return Object.keys(this.nomsAuteur).length
        ? traduireNom(this.nomsAuteur, this.languesPréférées)
        : "Incognito";
    },
  },
  methods: {
    couper,
    initialiserSuivi: async function () {
      const oublierNomsAuteur = await this.$ipa.réseau!.suivreNomsMembre(
        this.idAuteur,
        (noms) => {
          this.nomsAuteur = noms;
        }
      );
      this.suivre([oublierNomsAuteur]);
    },
  },
});
</script>

<style></style>
