<template>
  <v-menu
    transition="slide-y-transition"
    bottom
    :close-on-content-click="false"
    offset-y
  >
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" icon>
        <v-icon>mdi-download</v-icon>
      </v-btn>
    </template>

    <v-tabs v-model="onglet">
      <v-tab>
        <v-icon left>
          mdi-file
        </v-icon>
        Fichier
      </v-tab>
      <v-tab>
        <v-icon left>
          mdi-xml
        </v-icon>
        Programmatique
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="onglet">
      <v-tab-item>
        <v-card flat class="pa-2">
          <v-card-text>
            <v-select
              v-model="formatDoc"
              outlined
              dense
              hide-details
              :label="$t('lienTélécharger.formatFichier')"
              :items="['csv', 'odt', 'xlsx']"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              tiled
              outlined
              small
              class="mx-2"
              @click="téléchargerDoc;"
            >
              {{ $t("lienTélécharger.copier") }}
              <v-icon right>mdi-download</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat class="pa-2">
          <v-card-text>
            <v-select
              v-model="langueInfo"
              outlined
              dense
              :items="['Python', 'JavaScript']"
              :label="$t('lienTélécharger.langageInformatique')"
            ></v-select>
            <v-textarea
              outlined
              :value="codeTélécharger"
              :readonly="true"
              hide-details
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              tiled
              outlined
              small
              class="mx-2"
              @click="copier(codeTélécharger)"
            >
              {{ $t("lienTélécharger.copier") }}
              <v-icon right>mdi-content-copy</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-menu>
</template>

<script>
export default {
  name: "lienOrbit",
  props: ["lien"],
  data: function () {
    return {
      copié: false,
      onglet: null,
      langueInfo: "Python",
      formatDoc: "csv",
    };
  },
  computed: {
    codeTélécharger: function () {
      switch (this.langueInfo.toLowerCase()) {
        case "python":
          return `import constellation as cst\n\ncst.obtenir_données("${this.lien}")`;
        case "javascript":
          return `import { obtenirDonnées } from "constellation-ipa"\n\nconst obtDonnées = await obtenirDonnées("${this.lien}")\n`;
        default:
          return "";
      }
    },
  },
  methods: {
    async copier(texte) {
      if (!navigator.clipboard) return;
      await navigator.clipboard.writeText(texte);
      this.copié = true;
    },
  },
};
</script>

<style></style>
