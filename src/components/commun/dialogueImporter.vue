<template>
  <v-dialog v-model="dialogue" scrollable max-width="1000">
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
        <v-stepper v-model="étape" horizontal>
          <v-stepper-header>
            <v-stepper-step :complete="étape > 1" step="1">
              {{ $t("importer.தேர்வுசெய்க") }}
            </v-stepper-step>
            <v-stepper-step :complete="étape > 2" step="2">
              {{ $t("importer.நெடுவரிசை") }}
            </v-stepper-step>
            <v-stepper-step :complete="étape > 3" step="3">
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
                <div class="text-center">
                  <v-chip
                    v-if="nomFichier"
                    class="ma-2"
                    close
                    color="green"
                    outlined
                    @click:close="nomFichier = false"
                  >
                    {{ nomFichier }}
                  </v-chip>
                </div>
                <v-container fluid>
                  <v-row align="center">
                    <v-col cols="12" sm="12">
                      <v-select
                        v-model="tableauSélectionné"
                        :items="tableauxFichier"
                        :menu-props="{ maxHeight: '75' }"
                        :disabled="!nomFichier"
                        :label="$t('communs.தேர்ந்தெடுக்கவும்')"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
              <v-card-actions>
                <v-btn :disabled="étape === 1" text @click="étape--">
                  {{ $t("bd.nouvelle.Retour") }}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  :disabled="!tableauSélectionné"
                  color="primary"
                  outlined
                  @click="étape++"
                >
                  {{ $t("bd.nouvelle.Suivant") }}
                </v-btn>
              </v-card-actions>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-card flat max-width="1000px" height="300px">
                <v-form>
                  <v-container>
                    <v-row align="center">
                      <v-col v-for="n in 1" :key="n" cols="12" sm="12" md="3">
                        <v-text-field
                          :menu-props="{ maxHeight: '50' }"
                          :label="$t('communs.colonne')"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="3">
                        <v-autocomplete
                          v-model="colonneSélectionné"
                          :items="colonneFichier"
                          :menu-props="{ maxHeight: '250' }"
                          :label="$t('communs.பெறுக')"
                        >
                        </v-autocomplete>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <v-btn @click="save">
                          {{ $t("communs.save") }}
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-form>
              </v-card>
              <v-card-actions>
                <v-btn :disabled="étape === 1" text @click="étape--">
                  {{ $t("bd.nouvelle.Retour") }}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="primary" outlined @click="étape++">
                  {{ $t("bd.nouvelle.Suivant") }}
                </v-btn>
              </v-card-actions>
            </v-stepper-content>
            <v-stepper-content step="3">
              <v-card class="mb-2" height="100px">
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
              </v-card>

              <v-card-actions>
                <v-btn :disabled="étape === 1" text @click="étape--">
                  {{ $t("bd.nouvelle.Retour") }}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  :disabled="(étape === 3 && !licence) || étape === 4"
                  color="primary"
                  outlined
                  @click="étape++"
                >
                  {{ $t("bd.nouvelle.Suivant") }}
                </v-btn>
              </v-card-actions>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import ImportateurFeuilleCalcul from "@/components/commun/xlsx";
import mixins from "vue-typed-mixins";
import XLSX, { read as readXLSX } from "xlsx";
import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";

import { tableaux } from "@constl/ipa";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "dialogueTéléverser",
  props: ["id", "type"],
  mixins: [mixinLangues, mixinIPA],
  data: function () {
    return {
      dialogue: false,
      enProgrès: false,
      formatDoc: "ods" as XLSX.BookType | "xls",
      inclureMédias: false,
      langueColonnes: undefined,
      étape: 1,
      importateur: undefined as ImportateurFeuilleCalcul | undefined,
      tableauxFichier: undefined as string[] | undefined,
      tableauSélectionné: undefined as string | undefined,
      nomFichier: undefined as string | undefined,
      colonneFichier: undefined as string[] | undefined,
      colonneSélectionné: undefined as string | undefined,

      colonnesTableauConstellation: undefined as
        | tableaux.InfoColAvecCatégorie[]
        | undefined,
    };
  },

  methods: {
    onFilePicked: async function (): Promise<void> {
      console.log("onFilePicked");
      const fichiers = this.$refs.fileInput as HTMLInputElement; // தேர்ந்தெடுத்தப்பட்டு கோப்பு
      console.log("fichiers", fichiers);
      if (!fichiers.files) return;
      const données = await fichiers!.files[0].arrayBuffer(); // கோப்பில் உள்ள தகவல்கள்
      console.log("données", données);
      const doc = readXLSX(données, {
        type: "buffer",
        cellDates: true,
      }); // கோப்பை யாவாக்கிறீட்டில் திறக்கவும்
      console.log("doc", doc);
      this.importateur = new ImportateurFeuilleCalcul(doc); // விண்மீன் மூலம் பகுப்பாய்வு செய்யலாம்
      console.log("this.importateur", this.importateur);
      this.nomFichier = fichiers!.files[0].name;
      console.log("this.nomFichier", this.nomFichier);
    },
    onPickFile: function (): void {
      console.log("onPickFile");
      const fileInput = this.$refs.fileInput as HTMLInputElement;
      fileInput.click();
    },

    initialiserSuivi: async function () {
      const oublierColonnesTableauConstellation =
        await this.$ipa.tableaux!.suivreColonnes({
          idTableau: this.id,
          f: (colonnes) => (this.colonnesTableauConstellation = colonnes),
        });

      this.suivre([oublierColonnesTableauConstellation]);
    },
  },
  watch: {
    importateur: async function (val: ImportateurFeuilleCalcul | undefined) {
      if (val) {
        this.tableauxFichier = val.obtNomsTableaux();
      } else {
        this.tableauxFichier = undefined;
      }
    },
    tableauSélectionné: async function (val: string | undefined) {
      if (val) {
        this.colonneFichier = this.importateur!.obtColsTableau(val);
      } else {
        this.colonneFichier = undefined;
      }
    },
  },
});
</script>
<style></style>
