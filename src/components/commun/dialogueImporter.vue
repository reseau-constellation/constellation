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
    <v-stepper v-model="e6" horizontal >
      <v-stepper-header>
        <v-stepper-step :complete="e6 > 1" step="1">
          {{ $t("importer.தேர்வுசெய்க") }}
        </v-stepper-step>
        <v-stepper-step :complete="e6 > 2" step="2">
          {{ $t("importer.நெடுவரிசை") }}
        </v-stepper-step>
        <v-stepper-step :complete="e6 > 3" step="3">
          {{ $t("importer.பதிவேற்றம்") }}
        </v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
     <v-stepper-content step="1">
       <v-card
       class="mb-2"
       height="70px"
       >
       <v-btn
          color="primary"
          text
          outlined
          :loading="enProgrès"
          @click="() => fichier()"
          >
          {{ $t("communs.fichier") }}
       </v-btn>
       <v-btn
       color="primary"
       @click="e6 = 2"
       :disabled="!suivante"
       >
       {{ $t("communs.suivante") }}
        </v-btn>
      </v-card>
       </v-stepper-content>
       <v-stepper-content step="2">
         <v-card
         class="mb-2"
         height="70px"
         >
         <v-btn
            color="primary"
            text
            outlined
            :loading="enProgrès"
            @click="() => colonne()"
            >
            {{ $t("communs.colonne") }}
         </v-btn>
         <v-btn
         color="primary"
         @click="e6 = 3"
         :disabled="!suivante"
         >
        {{ $t("communs.suivante") }}
          </v-btn>
       </v-card>
     </v-stepper-content>
     <v-stepper-content step="3">
       <v-card
         class="mb-2"
         height="70px"
         >
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
        <v-btn
        color="primary"
        @click="e6 = 1"
        :disabled="!suivante"
        >
        {{ $t("communs.suivante") }}
         </v-btn>
      </v-card>
     </v-stepper-content>
        <v-card-actions>
          <v-spacer></v-spacer>
           <v-btn color="secondary" text outlined @click="dialogue = false">
            {{ $t("communs.annuler") }}
            </v-btn>
            <v-btn color="secondary" text outlined @click="dialogue = false"
            :disabled="!fermer">
            {{ $t("communs.fermer") }}
          </v-btn>
        </v-card-actions>
      </v-stepper-items>
     </v-stepper>
    </template>
   <v-divider></v-divider>
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
      e6: 1,
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
