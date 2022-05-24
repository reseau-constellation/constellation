<template>
  <v-navigation-drawer permanent app expand-on-hover :right="$vuetify.rtl">
    <v-list>
      <router-link to="/">
        <v-list-item class="px-2">
          <v-avatar>
            <v-img
              alt="Logo Constellation"
              class="shrink mr-2"
              contain
              :src="require('@/assets/logo-petit.svg')"
              transition="scale-transition"
              width="40"
            />
          </v-avatar>
        </v-list-item>
      </router-link>
    </v-list>

    <v-divider></v-divider>

    <v-list nav dense>
      <v-list-item
        v-for="l in liens"
        :key="l.texte"
        link
        @click="$router.push({ path: '/'.concat(l.page) })"
      >
        <v-list-item-avatar
          v-if="l.page === 'compte' && imageCompte"
          :size="25"
        >
          <v-img :src="imageCompte" />
        </v-list-item-avatar>
        <v-list-item-icon v-else>
          <v-icon> {{ l.icône }} </v-icon>
        </v-list-item-icon>
        <v-list-item-title
          :class="{ 'ms-4': l.page === 'compte' && imageCompte }"
        >
          {{ $t("nav.".concat(l.page)) }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinIPA from "@/mixins/ipa";

export default mixins(mixinIPA).extend({
  name: "Navigation",
  mixins: [mixinIPA],
  data: function () {
    return {
      imageCompte: null as null | string,
      liens: [
        {
          page: "compte",
          icône: "mdi-account",
        },
        {
          page: "bd",
          icône: "mdi-database",
        },
        {
          page: "recherche",
          icône: "mdi-magnify",
        },
        {
          page: "favoris",
          icône: "mdi-pin",
        },
        /*{
          page: "automatisation",
          icône: "mdi-sync",
        },*/
        {
          page: "signalements",
          icône: "mdi-bug",
        },
      ],
    };
  },
  methods: {
    initialiserSuivi: async function () {
      const oublierImage = await this.$ipa.profil!.suivreImage({
        f: (image) => {
          if (image) {
            const url = URL.createObjectURL(
              new Blob([image.buffer], { type: "image/png" })
            );
            this.imageCompte = url;
          } else {
            this.imageCompte = null;
          }
        },
      });
      this.suivre(oublierImage);
    },
  },
});
</script>

<style></style>
