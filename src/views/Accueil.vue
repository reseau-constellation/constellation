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

        <v-row class="center d-flex justify-space-around">
          <v-card
            v-for="(lien, i) in liens"
            :key="i"
            link
            class="ma-5"
            min-height="50"
            width="250"
            outlined
            tile
            @click="lien.page ? $router.push(lien.page) : ouvrirLien(lien.href)"
          >
            <v-card-text>
              <v-img :src="image(lien.img)" class="mx-4 mt-4" contain />
              <p class="mt-auto">{{ $t(lien.text) }}</p>
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
          class="mx-2"
          @click="$router.push('/conditions')"
        >
          {{ $t("conditions.entête") }}
        </v-btn>
        <v-btn
          v-if="!isElectron()"
          color="primary"
          tiled
          outlined
          small
          class="mx-2"
          @click="
            ouvrirLien('https://github.com/julienmalard/constellation/releases')
          "
        >
          {{ $t("communs.btnInstaller") }}
          <v-icon right>mdi-download</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <message-installer v-if="false" />
  </v-container>
</template>

<script>
import isElectron from "is-electron";
import { Component, Vue } from "vue-property-decorator";

import messageInstaller from "@/components/commun/messageInstaller";
import alerteConditions from "@/components/commun/alerteConditions";
import mixinImage from "@/mixins/images";
import { ouvrirLien } from "@/utils";

@Component({
  components: { alerteConditions, messageInstaller },
  data: function () {
    return {
      liens: [
        {
          text: "acceuil.liens.docs",
          href: `https://constallation.readthedocs.org/${this.$i18n.locale}/latest`,
          img: "docs",
        },
        {
          text: "acceuil.liens.recherche",
          page: "/recherche",
          img: "recherche",
        },
        {
          text: "acceuil.liens.projet",
          page: "/projets",
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
