<template>
  <v-col cols="12">
    <v-slide-x-transition group class="d-flex flex-wrap justify-center">
      <carte-membre
        v-for="membre in membres"
        :key="membre.id"
        :id="membre.id"
        :vuIlyA="membre.vuIlyA"
      />
    </v-slide-x-transition>
  </v-col>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinIPA from "@/mixins/ipa";

import carteMembre from "@/components/commun/carteMembre.vue";

import { utils } from "@constl/ipa";

export default mixins(mixinIPA).extend({
  name: "résultatsRecherchePersonnes",
  mixins: [mixinIPA],
  components: { carteMembre },
  data: function () {
    return {
      membres: [] as utils.résultatRecherche<utils.infoRésultat>[],
    };
  },
  methods: {
    initialiserSuivi: async function () {
      const { fOublier: oublierMembres } =
        await this.$ipa.réseau!.rechercherMembres({
          f: (membres) => {
            this.membres = membres;
          },
          nRésultatsDésirés: 5,
        });

      this.suivre([oublierMembres]);
    },
  },
});
</script>

<style></style>
