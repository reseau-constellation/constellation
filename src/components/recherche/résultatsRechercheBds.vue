<template>
  <v-col cols="12">
    <v-slide-x-transition group class="d-flex flex-wrap justify-center">
      <carte-bd
        v-for="bd in bds"
        :key="bd"
        :bd="bd"
        @click="$router.push(`/bd/visualiser/${encodeURIComponent(bd)}`)"
      />
    </v-slide-x-transition>
  </v-col>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinIPA from "@/mixins/ipa";
import carteBd from "@/components/BD/carteBD.vue";

import { utils } from "@constl/ipa";

export default mixins(mixinIPA).extend({
  name: "résultatsRecherchePersonnes",
  mixins: [mixinIPA],
  components: { carteBd },
  data: function () {
    return {
      bds: [] as utils.résultatRecherche<utils.infoRésultat>[],
    };
  },
  methods: {
    initialiserSuivi: async function () {
      const { fOublier: oublierBds } = await this.$ipa.réseau!.rechercherBds(
        (bds) => (this.bds = bds),
        5
      );

      this.suivre([oublierBds]);
    },
  },
});
</script>

<style></style>
