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
          {{ $t("accueil.entête") }}
        </h1>
        <p class="subheading font-weight-regular">
          {{ $t("accueil.soustitre") }}
        </p>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-5">
          {{ $t("accueil.orientation") }}
        </h2>

        <v-row class="center d-flex justify-space-around">
          <v-card
            v-for="(lien, i) in liens"
            :key="i"
            link
            class="ma-5"
            width="250"
            outlined
            tile
            @click="lien.page ? $router.push(lien.page) : ouvrirLien(lien.href)"
          >
            <v-img
              :src="image(lien.img)"
              class="mx-4 mt-4"
              height="125"
              contain
            />
            <v-card-text>
              <p class="text-h6">{{ $t(lien.text) }}</p>
            </v-card-text>
          </v-card>
        </v-row>
      </v-col>
      <v-col class="mb-5" cols="12">
        <v-btn
          color="primary"
          tiled
          outlined
          small
          class="ma-2"
          @click="$router.push('/conditions')"
        >
          {{ $t("conditions.entête") }}
        </v-btn>
        <v-btn
          color="primary"
          tiled
          outlined
          small
          class="ma-2"
          @click="ouvrirLien(URL_GIT)"
        >
          {{ $t("accueil.contribuerCode") }}
          <v-icon right>mdi-git</v-icon>
        </v-btn>
        <v-btn
          v-if="!isElectron()"
          color="primary"
          tiled
          outlined
          small
          class="ma-2"
          @click="$router.push(encodeURI('/téléchargements'))"
        >
          {{ $t("communs.btnInstaller") }}
          <v-icon right>mdi-download</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <message-installer v-if="!isElectron" />
  </v-container>
</template>

<script>
import isElectron from "is-electron";
import { Component, Vue } from "vue-property-decorator";

import messageInstaller from "@/components/commun/messageInstaller";
import alerteConditions from "@/components/commun/alerteConditions";
import mixinImage from "@/mixins/images";
import { ouvrirLien } from "@/utils";
import { URL_GIT, RACINE_URL_DOCS } from "@/utils/config";

@Component({
  components: { alerteConditions, messageInstaller },
  data: function () {
    return {
      URL_GIT,
      liens: [
        /*{
          text: "accueil.liens.docs",
          href: `${RACINE_URL_DOCS}/${this.$i18n.locale}/latest`,
          img: "docs",
        },*/
        {
          text: "accueil.liens.recherche",
          page: "/recherche",
          img: "recherche",
        },
        {
          text: "accueil.liens.projet",
          page: "/bd",
          img: "constr",
        },
      ],
    };
  },
  mixins: [mixinImage],
  computed: {
    conditionsAcceptées: function () {
      return this.$store.state.conditions.acceptées;
    },
  },
  methods: { ouvrirLien, isElectron },
})
export default class Home extends Vue {}
</script>
