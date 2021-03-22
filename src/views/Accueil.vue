<template>
  <v-container class="text-center">
    <v-row class="text-center">
      <alerte-conditions v-if="!conditionsAcceptées" />
      <v-col cols="12">
        <v-img
          :src="require('@/assets/logo.svg')"
          class="my-3"
          contain
          height="150"
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
            @click="
              lien.page ? $router.push(lien.page) : ouvrirNavigateur(lien.href)
            "
          >
            <v-img :src="image(lien.img)" class="mx-4 mt-4" contain />
            <v-card-text>{{ $t(lien.text) }}</v-card-text>
          </v-card>
        </v-row>
      </v-col>
      <v-col class="mb-5" cols="12">
        <router-link to="/conditions">
          <p>
            {{ $t("conditions.entête") }}
          </p>
        </router-link>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import isElectron from "is-electron";
import { Component, Vue } from "vue-property-decorator";

import alerteConditions from "@/components/commun/alerteConditions";
import mixinImage from "@/mixins/images";

import xlsx from "xlsx"; // À faire: enlever une fois que tout fonctionne
window.xlsx = xlsx;


@Component({
  data: function() {
    return {
      liens: [
        {
          text: "acceuil.liens.docs",
          href: `https://reseau.readthedocs.org/${this.$i18n.locale}/latest`,
          img: "docs"
        },
        {
          text: "acceuil.liens.recherche",
          page: "/recherche",
          img: "recherche"
        },
        {
          text: "acceuil.liens.projet",
          page: "/projets",
          img: "constr"
        }
      ]
    };
  },
  mixins: [mixinImage],
  components: { alerteConditions },
  computed: {
    conditionsAcceptées: function() {
      return this.$store.state.conditions.acceptées;
    }
  },
  methods: {
    ouvrirNavigateur: async function(lien: string) {
      if (isElectron()) {
        const electron = await import("electron");
        const { shell } = electron
        shell.openExternal(lien);
      } else {
        window.open(lien, '_newtab')
      }
    }
  }
})
export default class Home extends Vue {}
</script>
