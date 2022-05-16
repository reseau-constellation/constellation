<template>
  <v-dialog v-model="dialogue" scrollable max-width="600">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline mb-3">
        {{ $t("exporter.titre") }}
        <v-spacer />
        <v-btn
          icon
          @click="
            dialogue = false;
            enProgrès = false;
          "
        >
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
        <v-checkbox
          v-model="inclureMédias"
          :label="$t('exporter.inclureMédias')"
        />
        <v-autocomplete
          v-model="languesPourExportation"
          :items="langues"
          :label="$t('exporter.langues')"
          outlined
          multiple
        >
          <template v-slot:selection="data">
            <v-chip
              v-bind="data.attrs"
              :input-value="data.selected"
              close
              @click="data.select"
              @click:close="enleverLangue(data.item)"
            >
              {{ codeÀNomLangue(data.item) || data.item }}
            </v-chip>
          </template>
          <template v-slot:item="data">
            <v-list-item-content>
              <v-list-item-title>{{
                codeÀNomLangue(data.item) || data.item
              }}</v-list-item-title>
            </v-list-item-content>
          </template>
        </v-autocomplete>
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

import { rubiChabäl as codeÀNomLangue } from "nuchabal";
import { BookType, writeFile, writeXLSX } from "xlsx";
import toBuffer from "it-to-buffer";
import { bds, projets, utils } from "@constl/ipa";

import mixinLangues from "@/mixins/langues";

export default mixins(mixinLangues).extend({
  name: "dialogueTélécharger",
  props: ["id", "type"],
  mixins: [mixinLangues],
  data: function () {
    return {
      dialogue: false,
      enProgrès: false,

      formatDoc: "ods" as BookType | "xls",
      inclureMédias: false,
      languesPourExportation: [] as string[],
    };
  },
  mounted: function () {
    this.languesPourExportation = this.languesPréférées;
  },
  methods: {
    codeÀNomLangue,
    enleverLangue: function (langue: string) {
      const index = this.languesPourExportation.indexOf(langue);
      if (index >= 0) this.languesPourExportation.splice(index, 1);
    },
    télécharger: async function () {
      this.enProgrès = true;

      const conversionsTypes: { [key: string]: BookType } = {
        xls: "biff8",
      };
      const bookType: BookType =
        conversionsTypes[this.formatDoc] || this.formatDoc;

      const exporterFichierBd = async (
        données: bds.donnéesBdExportées
      ): Promise<void> => {
        const { doc, fichiersSFIP, nomFichier } = données;
        if (this.inclureMédias) {
          const fichierDoc = {
            octets: writeXLSX(doc, { bookType, type: "buffer" }),
            nom: `${nomFichier}.${this.formatDoc}`,
          };
          const fichiersDeSFIP = await Promise.all(
            [...fichiersSFIP].map(async (fichier) => {
              return {
                nom: `${fichier.cid}.${fichier.ext}`,
                octets: await toBuffer(
                  this.$ipa.obtItérableAsyncSFIP({ id: fichier.cid })
                ),
              };
            })
          );

          await utils.zipper([fichierDoc], fichiersDeSFIP, nomFichier);
        } else {
          writeFile(doc, `${nomFichier}.${this.formatDoc}`, {
            bookType,
          });
        }
      };

      const exporterFichierProjet = async (
        données: projets.donnéesProjetExportées
      ): Promise<void> => {
        const { docs, fichiersSFIP, nomFichier } = données;

        const fichiersDocs = docs.map((d) => {
          return {
            nom: `${d.nom}.${this.formatDoc}`,
            octets: writeXLSX(d.doc, { bookType, type: "buffer" }),
          };
        });
        const fichiersDeSFIP = this.inclureMédias
          ? await Promise.all(
              [...fichiersSFIP].map(async (fichier) => {
                return {
                  nom: `${fichier.cid}.${fichier.ext}`,
                  octets: await toBuffer(
                    this.$ipa.obtItérableAsyncSFIP({ id: fichier.cid })
                  ),
                };
              })
            )
          : [];

        await utils.zipper(fichiersDocs, fichiersDeSFIP, nomFichier);
      };

      try {
        switch (this.type) {
          case "bd": {
            const données = await this.$ipa.bds!.exporterDonnées({
              id: this.id,
              langues: this.languesPourExportation,
            });

            await exporterFichierBd(données);
            break;
          }

          case "tableau": {
            const données = await this.$ipa.tableaux!.exporterDonnées({
              idTableau: this.id,
              langues: this.languesPourExportation,
            });
            await exporterFichierBd(données);
            break;
          }

          case "projet": {
            const données = await this.$ipa.projets!.exporterDonnées({
              id: this.id,
              langues: this.languesPourExportation,
            });
            this.$ipa.projets!.exporterDocumentDonnées({
              données,
              formatDoc: this.formatDoc,
              inclureFichiersSFIP: this.inclureMédias,
            });
            break;
          }

          default:
            throw new Error(`"${this.type}" inconnu`);
        }
      } catch {
        // Rien à faire
      }
      this.dialogue = false;
      this.enProgrès = false;
    },
  },
});
</script>

<style></style>
