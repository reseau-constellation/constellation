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

import { TraductionRéseau } from "@/kilimukku/kilimukku";

import avatarProfil from "@/components/commun/avatarProfil.vue";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemTradCommunauté",
  props: {
    suggestion: {
      type: Object as () => TraductionRéseau,
    },
  },
  components: { avatarProfil },
  data: function () {
    return {
      nomsAuteur: {} as { [key: string]: string },
    };
  },
  computed: {
    idAuteur: function (): string {
      return this.suggestion.auteur;
    },
    traduction: function (): string {
      return this.suggestion.traduction;
    },
    date: function (): string {
      const date = this.suggestion.date;
      return this.formatterDate(date);
    },
    nom: function (): string {
      return Object.keys(this.nomsAuteur).length
        ? traduireNom(this.nomsAuteur, this.languesPréférées)
        : (this.$t("traduction.மறைமுகம்") as string);
    },
  },
  methods: {
    couper,
    initialiserSuivi: async function () {
      const oublierNomsAuteur = await this.$ipa.réseau!.suivreNomsMembre({
        idCompte: this.idAuteur,
        f: (noms) => {
          this.nomsAuteur = noms;
        },
      });
      this.suivre([oublierNomsAuteur]);
    },
  },
});
</script>

<style></style>
