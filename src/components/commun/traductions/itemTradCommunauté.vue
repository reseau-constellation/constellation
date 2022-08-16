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
    <v-list-item-actions>
      <v-btn
       v-if="autorisee"
       icon @click="()=>$emit('approuver')"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
      <v-btn icon @click="()=>$emit('copier')">
        <v-icon>mdi-content-copy</v-icon>
      </v-btn>
      <v-btn
        v-if="suggestion.auteur=idBdCompte"
        icon @click="()=>effacer()">
        <v-icon color="error">mdi-delete</v-icon>
      </v-btn>
    </v-list-item-actions>
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
    autorisee: {
      type: Boolean,
    }
  },
  components: { avatarProfil },
  data: function () {
    return {
      idBdCompte: undefined as string | undefined,
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
    effacer: async function () {
      await this.$kilimukku.effacerSuggestion({empreinte: this.suggestion.empreinte});
    },
    initialiserSuivi: async function () {
      const oublierIdBdCompte = await this.$ipa.suivreIdBdCompte({f: id=>this.idBdCompte = id});
      const oublierNomsAuteur = await this.$ipa.réseau!.suivreNomsMembre({
        idCompte: this.idAuteur,
        f: (noms) => {
          this.nomsAuteur = noms;
        },
      });
      this.suivre([oublierIdBdCompte, oublierNomsAuteur]);
    },
  },
});
</script>

<style></style>
