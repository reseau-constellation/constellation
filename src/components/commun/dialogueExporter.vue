<template>
  <v-dialog v-model="dialogue" scrollable max-width="600">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline mb-3">
        {{ $t("exporter.titre") }}
        <v-spacer />
        <v-btn icon @click="dialogue = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />

      <v-card-text class="mt-3 py-2">
        <v-select
          v-model="formatDoc"
          outlined
          dense
          hide-details
          :label="$t('exporter.formatFichier')"
          :items="['ods', 'csv', 'txt', 'xls', 'xlsx']"
        />
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="dialogue = false">
          {{ $t("communs.fermer") }}
        </v-btn>
        <v-btn
          color="primary"
          text
          outlined
          :loading="enProgrès"
          @click="() => télécharger()"
        >
          {{ $t("communs.télécharger") }}
          <v-icon right>mdi-download</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import XLSX from "xlsx";

import { uneFois, schémaFonctionSuivi } from "@/ipa/client";
import { traduire } from "@/ipa/utils";

import mixinLangues from "@/mixins/langues";

export default mixins(mixinLangues).extend({
  name: "dialogueTélécharger",
  props: ["id", "type"],
  mixins: [mixinLangues],
  data: function () {
    return {
      dialogue: false,
      enProgrès: false,

      formatDoc: "ods",
      inclureMédias: false,
      langueColonnes: undefined,
    };
  },
  methods: {
    télécharger: async function () {
      this.enProgrès = true;

      let doc: XLSX.WorkBook;
      try {
        switch (this.type) {
          case "bd":
            ({ doc } = await this.$ipa.bds!.exporterDonnées(
              this.id,
              this.languesPréférées
            ));
            break;

          case "tableau":
            ({ doc } = await this.$ipa.tableaux!.exporterDonnées(
              this.id,
              this.languesPréférées
            ));
            break;

          default:
            throw new Error(`"${this.type}" inconnu`);
        }
        const nomsBd = await uneFois(
          (f: schémaFonctionSuivi<{ [key: string]: string }>) =>
            this.$ipa.bds!.suivreNomsBd(this.id, f)
        );
        const nomFichier = traduire(nomsBd, this.languesPréférées) || this.id;

        const conversionsTypes: { [key: string]: XLSX.BookType } = {
          xls: "biff8",
        };
        const bookType: XLSX.BookType =
          conversionsTypes[this.formatDoc] || this.formatDoc;

        XLSX.writeFile(doc, `${nomFichier}.${this.formatDoc}`, { bookType });
      } catch {
        //Rien à faire
      }
      this.enProgrès = false;
    },
  },
});
</script>

<style></style>
