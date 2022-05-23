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
      <v-card-text>
        <v-stepper v-model="étape" horizontal flat>
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
              <v-card class="mb-2" flat>
                <v-file-input
                  v-model="fichier"
                  class="mt-2"
                  :label="$t('communs.fichier')"
                  accept=".csv,.ods,.xls,.xlsx"
                  outlined
                  chips
                >
                </v-file-input>

                <v-select
                  v-model="tableauSélectionné"
                  :items="tableauxFichier"
                  :menu-props="{ maxHeight: '75' }"
                  :disabled="!fichier"
                  :label="$t('importer.choisirTableau')"
                  prepend-icon="mdi-table"
                  outlined
                ></v-select>
              </v-card>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-card class="my-2" flat>
                <v-row align="center">
                  <v-col>
                    <v-autocomplete
                      v-model="colonneFichierSélectionnée"
                      :items="
                        (colonnesFichier || []).filter(
                          (c) =>
                            !Object.keys(correspondancesColonnes).includes(c)
                        )
                      "
                      :label="$t('importer.colonneImporter')"
                      hide-details
                      outlined
                      dense
                    ></v-autocomplete>
                  </v-col>
                  <v-col v-if="false" sm="12" md="3">
                    <v-text-field
                      v-model="conversion"
                      :label="$t('importer.colonneCible')"
                      hide-details
                      outlined
                      dense
                    >
                    </v-text-field>
                  </v-col>
                  <v-col sm="12" md="3">
                    <v-autocomplete
                      v-model="colonneConstellationSélectionnée"
                      :items="
                        (colonnesTableauConstellation || []).filter(
                          (c) =>
                            !Object.values(correspondancesColonnes)
                              .map((v) => v.colConstellation)
                              .includes(c.id)
                        )
                      "
                      :label="$t('importer.colonneCible')"
                      hide-details
                      outlined
                      dense
                    >
                      <template v-slot:item="{ on, item }">
                        <item-liste-colonnes v-on="on" :colonne="item" />
                      </template>
                      <template v-slot:selection="{ on, attrs, item }">
                        <jeton-variable
                          v-on="on"
                          v-bind="attrs"
                          :id="item.variable"
                        />
                      </template>
                      <template v-slot:append-outer>
                        <dialogue-nouvelle-colonne @sauvegarder="creerColonne">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              v-on="on"
                              v-bind="attrs"
                              icon
                              small
                              class="ma-0"
                            >
                              <v-icon small>mdi-plus</v-icon>
                            </v-btn>
                          </template>
                        </dialogue-nouvelle-colonne>
                      </template>
                    </v-autocomplete>
                  </v-col>
                  <v-col>
                    <v-btn
                      :disabled="!prêtPourSauvegarderCorrespondance"
                      text
                      outlined
                      color="secondary"
                      @click="sauvegarderCorrespondance"
                    >
                      {{ $t("communs.sauvegarder") }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-divider class="my-3" />
                <v-list>
                  <item-liste-correspondance-colonnes
                    v-for="corresp in correspondancesColonnes"
                    :key="corresp.colFichier"
                    :corresp="corresp"
                    :idVariable="
                      colonnesTableauConstellation.find(
                        (c) => c.id === corresp.colConstellation
                      ).variable
                    "
                    @effacer="() => effacerCorrespondance(corresp.colFichier)"
                  />
                </v-list>
              </v-card>
            </v-stepper-content>
            <v-stepper-content step="3">
              <v-card flat class="my-2 text-center">
                <v-btn
                  color="primary"
                  text
                  outlined
                  :loading="enProgrès"
                  @click="() => importer()"
                >
                  {{ $t("importer.importer") }}
                  <v-icon right>mdi-upload</v-icon>
                </v-btn>
              </v-card>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card-text>

      <v-card-actions>
        <v-btn :disabled="étape === 1" text @click="étape--">
          {{ $t("bd.nouvelle.Retour") }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!prêtPourSuivant"
          color="primary"
          outlined
          @click="étape++"
        >
          {{ $t("bd.nouvelle.Suivant") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import ImportateurFeuilleCalcul from "@/components/commun/xlsx";
import mixins from "vue-typed-mixins";
import { read as readXLSX } from "xlsx";
import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";

import { tableaux, valid } from "@constl/ipa";

import itemListeColonnes from "@/components/tableaux/colonnes/itemListeColonnes.vue";
import jetonVariable from "@/components/commun/jetonVariable.vue";
import itemListeCorrespondanceColonnes from "@/components/commun/itemListeCorrespondanceColonnes.vue";
import dialogueNouvelleColonne from "@/components/tableaux/colonnes/dialogueNouvelleColonne.vue";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "dialogueTéléverser",
  props: ["id", "type"],
  mixins: [mixinLangues, mixinIPA],
  components: {
    itemListeColonnes,
    jetonVariable,
    itemListeCorrespondanceColonnes,
    dialogueNouvelleColonne,
  },
  data: function () {
    return {
      dialogue: false,
      étape: 1,
      enProgrès: false,

      fichier: undefined as undefined | File,
      importateur: undefined as ImportateurFeuilleCalcul | undefined,
      tableauxFichier: undefined as string[] | undefined,
      tableauSélectionné: undefined as string | undefined,

      colonneFichierSélectionnée: undefined as string | undefined,
      colonneConstellationSélectionnée: undefined as
        | tableaux.InfoColAvecCatégorie
        | undefined,
      conversion: undefined as undefined | string | number,
      correspondancesColonnes: [] as {
        colFichier: string;
        colConstellation: string;
        conv?: string | number;
      }[],

      colonnesFichier: undefined as string[] | undefined,
      colonnesTableauConstellation: undefined as
        | tableaux.InfoColAvecCatégorie[]
        | undefined,
    };
  },
  computed: {
    prêtPourSuivant: function (): boolean {
      switch (this.étape) {
        case 1:
          return !!this.tableauSélectionné;
        case 2:
          return !!this.correspondancesColonnes;
        default:
          return false;
      }
    },
    prêtPourSauvegarderCorrespondance: function (): boolean {
      return !!(
        this.colonneFichierSélectionnée && this.colonneConstellationSélectionnée
      );
    },
  },
  watch: {
    fichier: async function (val: File | undefined) {
      if (val) {
        const données = await val.arrayBuffer(); // கோப்பில் உள்ள தகவல்கள்
        const doc = readXLSX(données, {
          type: "buffer",
          cellDates: true,
        }); // கோப்பை யாவாக்கிறீட்டில் திறக்கவும்
        this.importateur = new ImportateurFeuilleCalcul(doc); // விண்மீன் மூலம் பகுப்பாய்வு செய்யலாம்
        this.tableauxFichier = this.importateur.obtNomsTableaux();
        if (this.tableauxFichier.length === 1)
          this.tableauSélectionné = this.tableauxFichier[0];
        this.colonnesFichier = undefined;
      } else {
        this.tableauxFichier = undefined;
        this.colonnesFichier = undefined;
      }
    },
    tableauSélectionné: async function (val: string | undefined) {
      if (val) {
        this.colonnesFichier = this.importateur!.obtColsTableau(val);
      } else {
        this.colonnesFichier = undefined;
      }
    },
  },
  methods: {
    creerColonne: async function ({
      idVariable,
      règles,
    }: {
      idVariable: string;
      règles: valid.règleVariable[];
    }) {
      const idColonne = await this.$ipa.tableaux!.ajouterColonneTableau({
        idTableau: this.id,
        idVariable,
      });
      for (const règle of règles) {
        await this.$ipa.tableaux!.ajouterRègleTableau({
          idTableau: this.id,
          idColonne,
          règle,
        });
      }
    },
    sauvegarderCorrespondance: async function () {
      if (
        !this.colonneFichierSélectionnée ||
        !this.colonneConstellationSélectionnée
      )
        return;

      this.correspondancesColonnes = [
        ...this.correspondancesColonnes.filter(
          (c) => c.colFichier !== this.colonneFichierSélectionnée
        ),
        {
          colFichier: this.colonneFichierSélectionnée,
          colConstellation: this.colonneConstellationSélectionnée.id,
          conv: this.conversion,
        },
      ];
      this.colonneFichierSélectionnée = undefined;
      this.colonneConstellationSélectionnée = undefined;
      this.conversion = undefined;
    },
    effacerCorrespondance: async function (idColFichier: string) {
      this.correspondancesColonnes = this.correspondancesColonnes.filter(
        (c) => c.colFichier !== idColFichier
      );
    },
    importer: async function () {
      this.enProgrès = true;

      const données = this.importateur!.obtDonnées(
        this.tableauSélectionné!,
        Object.fromEntries(
          this.correspondancesColonnes.map((corresp) => [
            corresp.colConstellation,
            corresp.colFichier,
          ])
        )
      );
      await this.$ipa.tableaux!.importerDonnées({
        idTableau: this.id,
        données,
      });

      this.dialogue = false;
      this.enProgrès = false;
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
});
</script>
<style></style>
