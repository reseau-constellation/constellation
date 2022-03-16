<template>
  <v-menu
    offset-x
    :close-on-content-click="false"
    :disabled="!permissionModifier"
    transition="slide-y-transition"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-chip
        v-on="on"
        v-bind="attrs"
        :close="permissionModifier"
        outlined
        small
        label
        class="mx-1 my-1"
        close-icon="mdi-close"
        @click:close="$emit('effacer', { id })"
      >
        {{ couper(nom, 15) }}
      </v-chip>
    </template>
    <boîteNoms
      :noms="noms"
      :titre="$t('motsClefs.jeton.titreBoîteNoms')"
      :sousTitre="$t('motsClefs.jeton.sousTitreBoîteNoms')"
      @sauvegarder="sauvegarderNom"
      @changerLangue="changerLangueNom"
      @effacer="effacerNom"
    />
  </v-menu>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { couper, traduireNom } from "@/utils";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

import boîteNoms from "@/components/commun/boîteNoms/boîte.vue";

export default mixins(mixinIPA, mixinLangues).extend({
  name: "jetonMotClef",
  props: ["id", "permissionModifier"],
  mixins: [mixinLangues, mixinIPA],
  components: { boîteNoms },
  data: function () {
    return {
      noms: {} as { [key: string]: string },
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id.slice(9);
    },
  },
  methods: {
    couper,
    sauvegarderNom({ langue, nom }: { langue: string; nom: string }) {
      this.$ipa.motsClefs!.sauvegarderNomMotClef(this.id, langue, nom);
    },
    changerLangueNom({
      langueOriginale,
      langue,
      nom,
    }: {
      langueOriginale: string;
      langue: string;
      nom: string;
    }) {
      this.$ipa.motsClefs!.effacerNomMotClef(this.id, langueOriginale);
      this.$ipa.motsClefs!.sauvegarderNomMotClef(this.id, langue, nom);
    },
    effacerNom({ langue }: { langue: string }) {
      this.$ipa.motsClefs!.effacerNomMotClef(this.id, langue);
    },
    initialiserSuivi: async function () {
      const oublierNoms = await this.$ipa.motsClefs!.suivreNomsMotClef(
        this.id,
        (noms) => {
          this.noms = noms;
        }
      );

      this.suivre([oublierNoms]);
    },
  },
});
</script>

<style></style>
