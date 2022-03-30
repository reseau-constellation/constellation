<template>
  <v-dialog v-model="dialogue" scrollable max-width="600">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline mb-3">
        {{ $t("importer.titre") }}
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
          :label="$t('importer.formatFichier')"
          :items="['ods', 'csv', 'txt', 'xls', 'xlsx']"
        />
    <template>
    <v-stepper v-model="e6" vertical >
     <v-stepper-step :complete="e6 > 1" step="1">
       {{$t("importer.இணைக்கவும்") }}
       <small>{{ $t("importer.இணைக்க") }}</small>
        </v-stepper-step>

        <v-stepper-content step="1">
        <v-card
         color="grey lighten-1"
         class="mb-12"
         height="200px"
        ></v-card>
        <v-btn  color="primary" @click="e6 = 2">
         {{$t("importer.முன்செல்க") }}
        </v-btn>
         <v-btn text>
         {{$t("importer.ரத்துசெய்க") }}
       </v-btn>
     </v-stepper-content>
   </v-stepper>
  </template>

      <v-checkbox v-model="inclureMédias"></v-checkbox>
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
          @click="() => téléverser()"
        >
          {{ $t("communs.téléverser") }}
          <v-icon right>mdi-upload</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import XLSX from "xlsx";

import mixinLangues from "@/mixins/langues";

export default mixins(mixinLangues).extend({
  name: "dialogueTéléverser",
  props: ["id", "type"],
  mixins: [mixinLangues],
  data: function () {
    return {
      dialogue: false,
      enProgrès: false,

      formatDoc: "ods" as XLSX.BookType | "xls",
      inclureMédias: false,
      langueColonnes: undefined,
    };
  },
  methods: {
    téléverser: async function () {
      this.enProgrès = true;

      try {
        switch (this.type) {
          case "bd": {
            const données = await this.$ipa.bds!.exporterDonnées(
              this.id,
              this.languesPréférées
            );
            this.$ipa.bds!.exporterDocumentDonnées(
              données,
              this.formatDoc,
              undefined,
              this.inclureMédias
            );
            break;
          }

          case "tableau": {
            const données = await this.$ipa.tableaux!.exporterDonnées(
              this.id,
              this.languesPréférées
            );
            this.$ipa.bds!.exporterDocumentDonnées(
              données,
              this.formatDoc,
              undefined,
              this.inclureMédias
            );
            break;
          }

          case "projet": {
            const données = await this.$ipa.projets!.exporterDonnées(
              this.id,
              this.languesPréférées
            );
            this.$ipa.projets!.exporterDocumentDonnées(
              données,
              this.formatDoc,
              undefined,
              this.inclureMédias
            );
            break;
          }

          default:
            throw new Error(`"${this.type}" inconnu`);
        }
      } catch {
        // Rien à faire
      }
      this.enProgrès = false;
    },
  },
});
</script>

<style></style>
