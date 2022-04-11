<template>
  <v-col cols="12">
    <v-slide-x-transition group class="d-flex flex-wrap justify-center">
      <carte-membre
        v-for="membre in membres"
        :key="membre.idBdRacine"
        :id="membre.idBdRacine"
        :vuIlyA="membre.vuIlyA"
      />
    </v-slide-x-transition>
  </v-col>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinIPA from "@/mixins/ipa";

import carteMembre from "@/components/commun/carteMembre.vue";

import { infoMembreEnLigne } from "@constl/ipa/reseau";

export default mixins(mixinIPA).extend({
  name: "résultatsRecherchePersonnes",
  mixins: [mixinIPA],
  components: { carteMembre },
  data: function () {
    return {
      membres: [] as infoMembreEnLigne[],
    };
  },
  methods: {
    initialiserSuivi: async function () {
      const oublierMembres = await this.$ipa.réseau!.suivreMembres(
        (membres) => {
          this.membres = membres;
        }
      );

      this.suivre([oublierMembres]);
    },
  },
});
</script>

<style></style>
