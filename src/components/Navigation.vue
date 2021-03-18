<template>
  <v-navigation-drawer permanent app expand-on-hover :right="$vuetify.rtl">
    <v-list>
      <router-link to="/">
        <v-list-item class="px-2">
          <v-avatar>
            <v-img
              alt="Vuetify Logo"
              class="shrink mr-2"
              contain
              src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
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
        <v-list-item-icon>
          <v-icon> {{ l.icône }} </v-icon>
        </v-list-item-icon>
        <v-list-item-title> {{ $t("nav.".concat(l.page)) }} </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "Navigation",
  data: () => ({
    liens: [
      {
        page: "compte",
        icône: "mdi-account"
      },
      {
        page: "projets",
        icône: "mdi-folder"
      },
      {
        page: "bd",
        icône: "mdi-database"
      },
      {
        page: "recherche",
        icône: "mdi-magnify"
      },
      {
        page: "favoris",
        icône: "mdi-pin"
      },
      {
        page: "automation",
        icône: "mdi-sync"
      },{
        page: "signalements",
        icône: "mdi-bug"
      }
    ]
  })
};
</script>

<style></style>
