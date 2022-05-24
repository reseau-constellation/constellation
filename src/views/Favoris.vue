<template>
  <v-container class="text-center">
    <titre :entête="$t('favoris.entête')" :image="image('favoris')" />
    <v-col cols="12">
      <v-skeleton-loader
        v-if="favoris === undefined"
        type="list-item-avatar-two-line@2"
      />
      <span v-else-if="!favoris.length">
        <h2>{{ $t('favoris.aucun.titre') }}</h2>
        <p>{{ $t('favoris.aucun.sousTitre') }}</p>
        <v-btn color="primary" outlined text @click="$router.push('/bd')">{{ $t('favoris.aucun.bouton') }}</v-btn>
      </span>
      <v-slide-x-transition group class="d-flex flex-wrap mx-10">
        <item-liste-favoris v-for="f in favoris" :key="f.idObjet" :epingle="f"/>
      </v-slide-x-transition>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import Titre from "@/components/commun/Titre.vue";
import mixinImage from "@/mixins/images";
import mixinIPA from "@/mixins/ipa";

import { favoris } from "@constl/ipa";

import ItemListeFavoris from "@/components/favoris/itemListeFavoris.vue";

export default mixins(mixinImage, mixinIPA).extend({
  name: "Favoris",
  components: { Titre, ItemListeFavoris },
  mixins: [mixinImage, mixinIPA],
  data: function () {
    return {
      favoris: undefined as undefined | favoris.ÉlémentFavorisAvecObjet[],
    };
  },
  methods: {
    initialiserSuivi: async function () {
      const oublierFavoris = await this.$ipa.favoris!.suivreFavoris({
        f: (favoris) => {
          this.favoris = favoris;
        }
      });

      this.suivre([oublierFavoris]);
    },
  },
});
</script>

<style></style>
