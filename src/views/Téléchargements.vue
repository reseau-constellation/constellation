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
              :label="$t('téléchargements.Version')"
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
              :label="$t('téléchargements.Système')"
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
            {{ $t("téléchargements.பார்க்கவும்") }}
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

<script lang="ts">
import axios from "axios";
import isElectron from "is-electron";

import { ouvrirLien } from "@/utils";
import { URL_TÉLÉCHARGEMENTS, IPA_TÉLÉCHARGEMENTS } from "@/utils/config";
import mixinImage from "@/mixins/images";

import Titre from "@/components/commun/Titre.vue";
import carteFichierInstallation from "@/components/téléchargements/carteFichierInstallation.vue";

type SO = "Linux" | "macOS" | "Windows";

interface infoSO {
  nom: SO;
  logo: string;
  exts: string[];
}

interface publicationGitHub {
  url: string;
  id: number;
  node_id: string;
  name: string;
  label: string;
  content_type: string;
  state: string;
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  browser_download_url: string;
}

interface publicationGitHubAvecVersion extends publicationGitHub {
  version: string;
}

const obtExt = function (nomFichier: string) {
  return nomFichier.split(".").pop();
};

export default mixinImage.extend({
  name: "Téléchargements",
  components: { Titre, carteFichierInstallation },
  mixins: [mixinImage],
  data: function () {
    return {
      URL_TÉLÉCHARGEMENTS,
      IPA_TÉLÉCHARGEMENTS,
      fichiers: [] as publicationGitHubAvecVersion[],
      versions: [] as string[],
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
      ] as infoSO[],
      système: null as null | string,
      version: null as null | string,
      électron: isElectron(),
    };
  },
  computed: {
    fichiersChoisis: function (): publicationGitHubAvecVersion[] {
      const extsSoChoisi = this.système
        ? (
            this.systèmesOpératoirs.find(
              (s) => s.nom === this.système
            ) as infoSO
          ).exts
        : [];
      return this.fichiers
        .filter((f) => !this.version || f.version === this.version)
        .filter((f) => {
          const ext = obtExt(f.name);
          return !extsSoChoisi.length || (ext && extsSoChoisi.includes(ext));
        });
    },
  },
  methods: {
    ouvrirLien,
    soFichier: function (fichier: string): infoSO | undefined {
      const ext = obtExt(fichier);
      if (!ext) return;
      const so = this.systèmesOpératoirs.find((s) => s.exts.includes(ext));
      return so;
    },
    imageFichier: function (fichier: string): string {
      const so = this.soFichier(fichier);
      return so ? so.logo || this.image("docs") : this.image("docs");
    },
  },
  mounted: async function () {
    const json = (await axios.get(IPA_TÉLÉCHARGEMENTS)).data;

    const extentions = ["AppImage", "dmg", "exe"];

    for (const v of json) {
      const version = v.name as string;
      this.fichiers = [
        ...this.fichiers,
        ...v.assets
          .map((a: publicationGitHub) => {
            return { ...a, version };
          })
          .filter((a: publicationGitHubAvecVersion) => {
            const ext = obtExt(a.name);
            return ext && extentions.includes(ext);
          }),
      ];
      this.versions = [...this.versions, version];
      if (this.versions.length) this.version = this.versions[0];
    }
  },
});
</script>

<style></style>
