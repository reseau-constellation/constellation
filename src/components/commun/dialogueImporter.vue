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

      <template>
        <v-stepper v-model="e50" horizontal>
         <v-stepper-step :complete="e50 > 1" step="1">
          {{ $t("importer.தேர்வுசெய்க") }}
           <small>{{ $t("importer.தேர்வுசெய்") }}</small>
          </v-stepper-step>
           <v-stepper-content step="1">
            <v-btn
               color="primary"
               text
               outlined
               :loading="enProgrès"
               @click="() => fichier()"
             >
               {{ $t("communs.fichier") }}
            </v-btn>
          </v-stepper-content>
        </v-stepper>
      </template>
      <v-divider></v-divider>
     <v-card-actions>
       <v-spacer></v-spacer>
       <v-btn color="secondary" text outlined @click="dialogue = false">
         {{ $t("communs.annuler") }}
       </v-btn>

        <v-btn color="secondary" text outlined @click="dialogue = false">
        {{ $t("communs.fermer") }}
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
