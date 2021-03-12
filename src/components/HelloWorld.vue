<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <!--<v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        />-->
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          Bienvenue à RésEau
        </h1>
        <p class="subheading font-weight-regular">
          Le système décentralisé et ouvert pour le partage de données scientifiques.
        </p>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-5">
          Un peu perdu.e ?
        </h2>

        <v-row justify="center d-flex justify-space-around">
          <v-card
            v-for="(next, i) in whatsNext"
            :key="i"
            :href="next.href"
            class="ma-5" min-height="50" width="150"
            outlined tile
          >
            <v-card-text>{{ next.text }}</v-card-text>
          </v-card>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "HelloWorld",

  data: () => ({
    whatsNext: [
      {
        text: "Lire la documentation",
        href: "https://example.com"
      },
      {
        text: "Trouver des données",
        href: "https://example.com"
      },
      {
        text: "Démarrer un projet",
        href: "https://example.com"
      }
    ]
  })
});
</script>
