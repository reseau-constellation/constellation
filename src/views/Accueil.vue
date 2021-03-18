<template>
  <v-container class="text-center">
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('@/assets/logo.svg')"
          class="my-3"
          contain
          height="100"
        />
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          {{ $t("acceuil.entête") }}
        </h1>
        <p class="subheading font-weight-regular">
          {{ $t("acceuil.soustitre") }}
        </p>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-5">
          {{ $t("acceuil.orientation") }}
        </h2>

        <v-row justify="center d-flex justify-space-around">
          <v-card
            v-for="(lien, i) in liens"
            :key="i"
            link
            class="ma-5"
            min-height="50"
            width="175"
            outlined
            tile
            @click="lien.page ? $router.push(lien.page) : ouvrirNavigateur(lien.href)"
          >
            <v-img :src="lien.img" class="mx-4 mt-4" contain />
            <v-card-text>{{ $t(lien.text) }}</v-card-text>
          </v-card>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { shell } from 'electron'
import { Component, Vue } from "vue-property-decorator";
import xlsx from 'xlsx';  // À faire: enlever une fois que tout fonctionne
window.xlsx = xlsx

@Component({
  data: function() {
    return {
      liens: [
        {
          text: "acceuil.liens.docs",
          href: `https://reseau.readthedocs.org/${this.$i18n.locale}/latest`,
          img: require("@/assets/undraw/undraw_book_lover_mkck.svg")
        },
        {
          text: "acceuil.liens.recherche",
          page: "/recherche",
          img: require("@/assets/undraw/undraw_not_found_60pq.svg")
        },
        {
          text: "acceuil.liens.projet",
          page: "/projets",
          img: require("@/assets/undraw/undraw_under_construction_46pa.svg")
        }
      ]
    };
  },
  methods: {
    ouvrirNavigateur: function (lien:string) {
      shell.openExternal(lien)
    }
  }
})
export default class Home extends Vue {}
</script>
