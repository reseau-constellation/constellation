<template>
  <v-container>
    <titre :entête="$t('téléchargements.entête')" />

    <v-col cols="12">
      <v-toolbar class="mb-4">
        <v-row>
          <v-col cols="4">
            <v-select
              dense
              hide-details
              label="Version"
              clearable
              v-model="version"
              :items="versions"
              outlined
            ></v-select>
          </v-col>
          <v-col cols="4">
            <v-select
              dense
              hide-details
              clearable
              label="Système opératoire"
              v-model="système"
              :items="systèmesOpératoirs.map((x) => x.nom)"
              outlined
            ></v-select>
          </v-col>
          <v-col cols="4">
            <v-btn
              tiled
              outlined
              color="primary"
              @click="ouvrirLien(URL_TÉLÉCHARGEMENTS)"
            >
              Voir toutes les versions
              <v-icon right>mdi-open-in-new</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-toolbar>

      <v-slide-x-transition group class="d-flex flex-wrap justify-center">
        <carte-fichier-installation
          v-for="fichier in fichiersChoisis"
          :key="fichier.id"
          :url="fichier.browser_download_url"
          :version="fichier.version"
          :img="imageFichier(fichier.name)"
          :SO="soFichier(fichier.name).nom"
        />
      </v-slide-x-transition>
    </v-col>
  </v-container>
</template>

<script>
import axios from "axios";
import isElectron from "is-electron";

import { ouvrirLien } from "@/utils";
import { URL_TÉLÉCHARGEMENTS, IPA_TÉLÉCHARGEMENTS } from "@/utils/config";
import mixinImage from "@/mixins/images";

import Titre from "@/components/commun/Titre";
import carteFichierInstallation from "@/components/téléchargements/carteFichierInstallation";

const obtExt = function (nomFichier) {
  return nomFichier.split(".").pop();
};

export default {
  name: "Téléchargements",
  components: { Titre, carteFichierInstallation },
  mixins: [mixinImage],
  data: function () {
    return {
      URL_TÉLÉCHARGEMENTS,
      IPA_TÉLÉCHARGEMENTS,
      fichiers: [],
      versions: [],
      systèmesOpératoirs: [
        {
          nom: "Linux",
          logo: require("@/assets/logosSO/Linux.png"),
          exts: ["AppImage"],
        },
        {
          nom: "macOS",
          logo: require("@/assets/logosSO/macOS.png"),
          exts: ["dmg"],
        },
        {
          nom: "Windows",
          logo: require("@/assets/logosSO/Windows.png"),
          exts: ["exe"],
        },
      ],
      système: null,
      version: null,
      électron: isElectron(),
    };
  },
  computed: {
    fichiersChoisis: function () {
      const extsSoChoisi = this.système
        ? this.systèmesOpératoirs.find((s) => s.nom === this.système).exts
        : [];
      return this.fichiers
        .filter((f) => !this.version || f.version === this.version)
        .filter(
          (f) => !extsSoChoisi.length || extsSoChoisi.includes(obtExt(f.name))
        );
    },
  },
  methods: {
    ouvrirLien,
    soFichier: function (fichier) {
      const ext = obtExt(fichier);
      const so = this.systèmesOpératoirs.find((s) => s.exts.includes(ext));
      return so;
    },
    imageFichier: function (fichier) {
      const so = this.soFichier(fichier);
      return so.logo || this.image("docs");
    },
  },
  mounted: async function () {
    const json = (await axios.get(IPA_TÉLÉCHARGEMENTS)).data;

    const extentions = ["AppImage", "dmg", "exe"];

    for (const v of json) {
      const version = v.name;
      this.fichiers = [
        ...this.fichiers,
        ...v.assets
          .map((a) => {
            return { ...a, version };
          })
          .filter((a) => extentions.includes(obtExt(a.name))),
      ];
      this.versions = [...this.versions, version];
      if (this.versions.length) this.version = this.versions[0];
    }
  },
};
</script>

<style></style>
