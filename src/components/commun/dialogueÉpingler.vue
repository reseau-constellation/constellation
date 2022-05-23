<template>
  <v-dialog v-model="dialogue" scrollable max-width="600">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline mb-3">
        {{ $t("épingler.titre") }}
        <v-spacer />
        <v-btn icon @click="dialogue = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />

      <v-card-text class="mt-3 py-2">
        <p class="mb-0 text-overline">
          {{ $t("épingler.dispositifsÉpingle") }}
        </p>
        <v-radio-group v-model="typeDispositifs">
          <v-radio :label="$t('épingler.AUCUN')" value="AUCUN" />
          <v-radio :label="$t('épingler.TOUS')" value="TOUS" />
          <v-radio :label="$t('épingler.INSTALLÉ')" value="INSTALLÉ" />
          <v-radio
            :label="$t('épingler.dispositifsSpécifiques')"
            value="SPÉCIFIQUES"
          />
          <v-autocomplete
            v-model="dispositifsSpécifiques"
            :disabled="typeDispositifs !== 'SPÉCIFIQUES'"
            :items="dispositifs"
            class="ms-8"
            hide-details
            chips
            deletable-chips
            multiple
            dense
            outlined
          />
        </v-radio-group>

        <span v-if="optionFichiers">
          <p class="mb-0 text-overline">
            {{ $t("épingler.dispositifsÉpingleFichier") }}
          </p>
          <v-radio-group
            v-model="typeDispositifsFichiers"
            :disabled="typeDispositifs === 'AUCUN'"
          >
            <v-radio :label="$t('épingler.AUCUN')" value="AUCUN" />
            <v-radio :label="$t('épingler.TOUS')" value="TOUS" />
            <v-radio :label="$t('épingler.INSTALLÉ')" value="INSTALLÉ" />
            <v-radio
              :label="$t('épingler.dispositifsSpécifiques')"
              value="SPÉCIFIQUES"
            />
          </v-radio-group>
          <v-autocomplete
            v-model="dispositifsFichiersSpécifiques"
            :disabled="
              typeDispositifsFichiers !== 'SPÉCIFIQUES' ||
              typeDispositifs === 'AUCUN'
            "
            class="ms-8"
            hide-details
            chips
            deletable-chips
            dense
            outlined
            multiple
          />
        </span>
        <v-checkbox
          v-model="récursif"
          :label="$t('épingler.récursif')"
          :disabled="typeDispositifs === 'AUCUN'"
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
          :disabled="!prêtÀÉpingler"
          @click="() => épingler()"
        >
          {{ $t("communs.sauvegarder") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { favoris } from "@constl/ipa";

import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "dialogueÉpingler",
  props: {
    id: String,
    optionFichiers: {
      type: Boolean,
      default: true,
    },
  },
  mixins: [mixinIPA, mixinLangues],
  data: function () {
    return {
      dialogue: false,
      enProgrès: false,

      typeDispositifs: "TOUS" as "AUCUN" | "TOUS" | "INSTALLÉ" | "SPÉCIFIQUES",
      typeDispositifsFichiers: "INSTALLÉ" as
        | "AUCUN"
        | "TOUS"
        | "INSTALLÉ"
        | "SPÉCIFIQUES",
      dispositifsSpécifiques: [] as string[],
      dispositifsFichiersSpécifiques: [] as string[],
      récursif: true,

      dispositifs: [] as string[],
    };
  },
  computed: {
    dispositifsSélectionnés: function (): favoris.typeDispositifs | undefined {
      if (this.typeDispositifs === "AUCUN") return undefined;
      return this.typeDispositifs === "SPÉCIFIQUES"
        ? this.dispositifsSpécifiques
        : this.typeDispositifs;
    },
    dispositifsFichiers: function (): favoris.typeDispositifs | undefined {
      if (this.typeDispositifsFichiers === "AUCUN") return undefined;
      return this.typeDispositifsFichiers === "SPÉCIFIQUES"
        ? this.dispositifsFichiersSpécifiques
        : this.typeDispositifsFichiers;
    },
    prêtÀÉpingler: function (): boolean {
      const dispositifsPrêts =
        this.typeDispositifs === "SPÉCIFIQUES"
          ? !!this.dispositifsSpécifiques.length
          : true;
      const dispositifsFichiersPrêts =
        this.typeDispositifsFichiers === "SPÉCIFIQUES"
          ? !!this.dispositifsFichiersSpécifiques.length
          : true;
      return dispositifsPrêts && dispositifsFichiersPrêts;
    },
  },
  methods: {
    épingler: async function () {
      this.enProgrès = true;

      if (this.dispositifsSélectionnés) {
        const épingle: {
          id: string;
          dispositifs: favoris.typeDispositifs;
          dispositifsFichiers?: favoris.typeDispositifs;
          récursif: boolean;
        } = {
          id: this.id,
          dispositifs: this.dispositifsSélectionnés,
          récursif: this.récursif,
        };
        if (this.dispositifsFichiers)
          épingle.dispositifsFichiers = this.dispositifsFichiers;

        await this.$ipa.favoris!.épinglerFavori(épingle);
      } else {
        await this.désépingler();
      }

      this.dialogue = false;
      this.enProgrès = false;
    },

    désépingler: async function () {
      await this.$ipa.favoris!.désépinglerFavori({ id: this.id });
    },

    initialiserSuivi: async function () {
      const oublierDispositifs = await this.$ipa.suivreDispositifs({
        f: (dispositifs) => (this.dispositifs = dispositifs),
      });

      const oublierÉtatFavoris = await this.$ipa.favoris!.suivreÉtatFavori({
        id: this.id,
        f: (état) => {
          if (état) {
            this.récursif = état.récursif;

            if (
              typeof état.dispositifs === "string" &&
              ["TOUS", "INSTALLÉ", "AUCUN"].includes(état.dispositifs)
            ) {
              this.typeDispositifs = état.dispositifs as
                | "TOUS"
                | "AUCUN"
                | "INSTALLÉ";
            } else {
              this.typeDispositifs = "SPÉCIFIQUES";
              this.dispositifsSpécifiques =
                typeof état.dispositifs === "string"
                  ? [état.dispositifs]
                  : état.dispositifs;
            }

            if (
              typeof état.dispositifsFichiers === "string" &&
              ["TOUS", "INSTALLÉ", "AUCUN"].includes(état.dispositifsFichiers)
            ) {
              this.typeDispositifsFichiers = état.dispositifsFichiers as
                | "TOUS"
                | "AUCUN"
                | "INSTALLÉ";
            } else if (état.dispositifsFichiers) {
              this.typeDispositifsFichiers = "SPÉCIFIQUES";
              this.dispositifsFichiersSpécifiques =
                typeof état.dispositifsFichiers === "string"
                  ? [état.dispositifsFichiers]
                  : état.dispositifsFichiers;
            } else {
              this.typeDispositifsFichiers = "AUCUN";
            }
          } else {
            // On laisse this.typeDispositifsFichiers avec "INSTALLÉ" par défaut
            this.typeDispositifs = "AUCUN";
            this.dispositifsSpécifiques = [];
            this.dispositifsFichiersSpécifiques = [];
          }
        },
      });

      this.suivre([oublierÉtatFavoris, oublierDispositifs]);
    },
  },
});
</script>

<style></style>
