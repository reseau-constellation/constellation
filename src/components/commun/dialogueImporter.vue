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
        <v-stepper v-model="e6" horizontal>
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
              <v-card class="mb-2" height="200px">
                <v-btn
                  color="primary"
                  text
                  outlined
                  :loading="enProgrès"
                  @click="onPickFile"
                >
                  {{ $t("communs.fichier") }}
                  <input
                    type="file"
                    style="display: none"
                    ref="fileInput"
                    accept=".csv,.ods,.xls,.xlsx"
                    @change="onFilePicked"
                  />
                </v-btn>
                <v-container fluid>
                  <v-row align="center">
                    <v-col cols="12" sm="12">
                      <v-select
                        v-model="e7"
                        :items="அட்டவணை"
                        :menu-props="{ maxHeight: '50' }"
                        :label="$t('communs.தேர்ந்தெடுக்கவும்')"
                        multiple
                        hint="பயனாளர் ஒரு அட்டவணையை தேர்ந்தெடுக்கவும்"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-container>

                <v-btn color="primary" @click="e6 = 2" :disabled="!onPickFile">
                  {{ $t("communs.suivante") }}
                </v-btn>
              </v-card>
            </v-stepper-content>
            <v-stepper-content step="2">
              <v-card class="mb-2" height="70px">
                color="primary" text outlined :loading="enProgrès" @click="() =>
                colonne()" >
                {{ $t("communs.colonne") }}

                <v-btn color="primary" @click="e6 = 3" :disabled="!colonne">
                  {{ $t("communs.suivante") }}
                </v-btn>
              </v-card>
            </v-stepper-content>
            <v-stepper-content step="3">
              <v-card class="mb-2" height="70px">
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
                <v-btn color="primary" @click="e6 = 1" :disabled="!téléverser">
                  {{ $t("communs.suivante") }}
                </v-btn>
              </v-card>
            </v-stepper-content>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="secondary" text outlined @click="dialogue = false">
                {{ $t("communs.annuler") }}
              </v-btn>
              <v-btn color="secondary" text outlined @click="dialogue = false">
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
import ImportateurFeuilleCalcul from "@/components/commun/xlsx";
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
      importateur: undefined as ImportateurFeuilleCalcul | undefined,
      colonnesFichier: undefined as string[] | undefined,
      e7: [],
      அட்டவணை: ["colonnesFichier"],
    };
  },

  methods: {
    onFilePicked: async function (): Promise<void> {
      const fichiers = this.$refs.fileInput as HTMLInputElement; // தேர்ந்தெடுத்தப்பட்டு கோப்பு
      if (!fichiers.files) return;
      const données = await fichiers!.files[0].arrayBuffer(); // கோப்பில் உள்ள தகவல்கள்
      const doc = XLSX.read(données); // கோப்பை யாவாக்கிறீட்டில் திறக்கவும்

      this.importateur = new ImportateurFeuilleCalcul(doc); // விண்மீன் மூலம் பகுப்பாய்வு செய்யலாம்
    },
    onPickFile: function (): void {
      //@ts-ignor
      const fileInput = this.$refs.fileInput as HTMLInputElement;
      fileInput.click();
    },
    watch: {
      importateur: async function (val: ImportateurFeuilleCalcul | undefined) {
        if (val) {
          this.colonnesFichier = val.obtNomsTableaux();
        } else {
          this.colonnesFichier = undefined;
        }
      },
    },
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
