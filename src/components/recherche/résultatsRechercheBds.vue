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

<script>
import mixinIPA from "@/mixins/ipa";
import carteMembre from "@/components/commun/carteMembre";
import carteBd from "@/components/BD/carteBD";

export default {
  name: "résultatsRecherchePersonnes",
  mixins: [mixinIPA],
  components: { carteBd },
  data: function() {
    return {
      bds: []
    };
  },
  methods: {
    initialiserSuivi: async function() {
      const oublierBds = await this.$ipa.réseau.suivreBds(bds => {
        this.bds = bds;
      });

      this.suivre([oublierBds]);
    }
  }
};
</script>

<style></style>
