<template>
  <v-container class="text-center">
    <titre :entête="$t('favoris.entête')" :image="image('favoris')" />
    <v-col cols="12">
      <v-slide-x-transition group class="d-flex flex-wrap justify-center">
        <carte-bd
          v-for="bd in favoris"
          :key="bd"
          :bd="bd"
          @click="$router.push(`/bd/visualiser/${encodeURIComponent(bd)}`)"
        />
      </v-slide-x-transition>
    </v-col>
  </v-container>
</template>

<script>
import Titre from "@/components/commun/Titre";
import carteBd from "@/components/BD/carteBD";
import mixinImage from "@/mixins/images";
import mixinIPA from "@/mixins/ipa";

export default {
  name: "Favoris",
  components: { Titre, carteBd },
  mixins: [mixinImage, mixinIPA],
  data: function() {
    return {
      favoris: []
    };
  },
  methods: {
    initialiserSuivi: async function() {
      const oublierFavoris = await this.$ipa.favoris.suivreFavoris(favoris => {
        this.favoris = favoris;
      });

      this.suivre([oublierFavoris]);
    }
  }
};
</script>

<style></style>
