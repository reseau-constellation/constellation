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
    <v-stepper v-model="étape" horizontal >
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
       <v-card
       class="mb-2"
       height="200px"
       >
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
          @change="onFilePicked"/>
       </v-btn>
       <div class="text-center">
        <v-chip
        v-if="nomFichier"
        class="ma-2"
        close
        color="green"
        outlined
        @click:close="nomFichier= false"
       >
      {{nomFichier}}
      </v-chip>
    </div>
       <v-container fluid>
         <v-row align="center">
           <v-col
           cols="12"
           sm="12">
           <v-select
           v-model="tableauSélectionné"
           :items="tableauxFichier"
           :menu-props="{ maxHeight: '75' }"
           :disabled="!nomFichier"
           :label="$t('communs.தேர்ந்தெடுக்கவும்')"
            multiple
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
<v-card
  class="mb-2"
  height="125px">
  <v-btn
     color="primary"
       text
       outlined
       :loading="enProgrès"
       @click="() => obtColsTableau()"
       >
  </v-btn>
   <v-container fluid>
     <v-row align="center">
       <v-col
       cols="12"
       sm="12">
       <v-autocomplete
       v-model="colonneSélectionné"
       :items="obtColsTableau"
       :menu-props="{ maxHeight: '75' }"
       :label="$t('communs.பெறுக')"
        multiple
       ></v-autocomplete>
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
        :disabled="!obtColsTableau"
        color="primary"
        outlined
        @click="étape++"
      >
        {{ $t("bd.nouvelle.Suivant") }}
      </v-btn>
    </v-card-actions>

</v-stepper-content>
     <v-stepper-content step="3">
       <v-card
         class="mb-2"
         height="100px">
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
      étape: 1,
      importateur: undefined as ImportateurFeuilleCalcul | undefined,
      tableauxFichier: undefined as string[] | undefined,
      tableauSélectionné:  undefined as string | undefined,
      nomFichier: undefined as string | undefined,
      obtColsTableau: undefined as string | undefined,
    };
  },

  methods: {
    onFilePicked: async function(): Promise<void> {
      console.log("onFilePicked")
      const fichiers = this.$refs.fileInput as HTMLInputElement; // தேர்ந்தெடுத்தப்பட்டு கோப்பு
      console.log("fichiers",fichiers )
      if (!fichiers.files) return
      const données = await fichiers!.files[0].arrayBuffer(); // கோப்பில் உள்ள தகவல்கள்
      console.log("données",données )
      const doc = readXLSX(données, {
       type: "buffer",
       cellDates: true,
       }) ;// கோப்பை யாவாக்கிறீட்டில் திறக்கவும்
      console.log("doc",doc)
      this.importateur = new ImportateurFeuilleCalcul(doc); // விண்மீன் மூலம் பகுப்பாய்வு செய்யலாம்
      console.log("this.importateur",this.importateur)
      this.nomFichier = fichiers!.files[0].name;
      console.log("this.nomFichier",this.nomFichier)
      },
     onPickFile: function ():void {
       console.log("onPickFile" )
        const fileInput = this.$refs.fileInput as HTMLInputElement
        fileInput.click()
      },
   },
  watch: {
    importateur: async function (val: ImportateurFeuilleCalcul | undefined )
        {
         if (val) {
           this.tableauxFichier = val.obtNomsTableaux()
            }
            else {
              this.tableauxFichier = undefined
           }
        },
     },
  });
</script>
<style></style>
