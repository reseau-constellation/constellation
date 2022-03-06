<template>
  <v-container>
    <v-card flat>
      <v-card-subtitle>
        <v-breadcrumbs :items="petitPousset" class="pa-0">
          <template v-slot:divider>
            <v-icon>{{
              $vuetify.rtl ? "mdi-chevron-left" : "mdi-chevron-right"
            }}</v-icon>
          </template>
          <template v-slot:item="{ item }">
            <v-breadcrumbs-item
              :disabled="item.disabled"
              @click="$router.push(item.href)"
            >
              {{ item.text }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
      </v-card-subtitle>
      <v-card-title class="title font-weight-regular justify-space-between">
        <span>{{ titrePrésent }}</span>
        <v-avatar
          color="primary lighten-2"
          class="subheading white--text"
          size="24"
          v-text="formatterChiffre(étape)"
        ></v-avatar>
      </v-card-title>
      <v-divider />

      <v-window v-model="étape">
        <v-window-item :value="1">
          <v-card-text>
            <span class="grey--text text--darken-1">
              {{ $t("bd.nouvelle.மாற்றுதல்") }}
            </span>
            <v-list style="max-height: 300px" class="overflow-y-auto">
              <item-nouveau-nom
                :languesExistantes="Object.keys(this.noms)"
                :etiquetteNom="$t('bd.nouvelle.Nom')"
                :etiquetteLangue="$t('bd.nouvelle.Langue')"
                @sauvegarder="sauvegarderNom"
              />
              <v-divider />
              <item-nom
                v-for="(nom, langue) in noms"
                :key="langue"
                :nomOriginal="nom"
                :langueOriginale="langue"
                @sauvegarder="sauvegarderNom"
                @effacer="effacerNom"
                @changerLangue="changerLangueNom"
              />
            </v-list>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="2">
          <v-card-text>
            <span class="grey--text text--darken-1">
              {{ $t("bd.nouvelle.இருக்கிறது") }}
            </span>
            <v-list style="max-height: 300px" class="overflow-y-auto">
              <item-nouveau-nom
                :languesExistantes="Object.keys(this.descriptions)"
                :etiquetteNom="$t('bd.nouvelle.Description')"
                :etiquetteLangue="$t('bd.nouvelle.Langue')"
                @sauvegarder="sauvegarderDescr"
              />
              <v-divider />
              <item-nom
                v-for="(descr, langue) in descriptions"
                :key="langue"
                :nomOriginal="descr"
                :langueOriginale="langue"
                @sauvegarder="sauvegarderDescr"
                @effacer="effacerDescr"
                @changerLangue="changerLangueDescr"
              />
            </v-list>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="3">
          <v-card-text>
            <p class="grey--text text--darken-1 mb-3">
              {{ $t("licences.avertissement") }}
            </p>
            <v-select
              v-model="licence"
              :items="itemsLicences"
              :label="$t('bd.nouvelle.Licence')"
              outlined
              dense
              hide-details
            />
            <v-checkbox
              v-model="licencesSpécilisées"
              :label="$t('bd.nouvelle.சேர்க்கவும்')"
            />

            <v-card v-if="licence" flat class="mx-3 mb-3">
              <p>
                <v-icon small>mdi-alert-circle-outline</v-icon>
                {{ $t("licences.avertissement") }}
              </p>
              <div class="d-flex flex-wrap">
                <v-card flat min-width="200" max-width="350" class="mb-3 ma-2">
                  <p class="mb-0 text-overline">
                    {{ $t("bd.nouvelle.Permissions") }}</p>
                  <p v-if="!droits.length" class="text--disabled">
                    {{ $t("licences.droits.aucune") }}
                  </p>
                  <jeton-droit v-for="p in droits" :key="p" :droit="p" />
                </v-card>
                <v-card flat min-width="200" max-width="350" class="mb-3 ma-2">
                  <p class="mb-0 text-overline">
                    {{ $t("bd.nouvelle.Conditions") }}</p>
                  <p v-if="!conditions.length" class="text--disabled">
                    {{ $t("licences.conditions.aucune") }}
                  </p>
                  <jeton-condition
                    v-for="c in conditions"
                    :key="c"
                    :condition="c"
                  />
                </v-card>
                <v-card flat min-width="200" max-width="350" class="mb-3 ma-2">
                  <p class="mb-0 text-overline">
                    {{ $t("bd.nouvelle.Limitations") }}</p>
                  <p v-if="!limitations.length" class="text--disabled">
                    {{ $t("licences.limitations.aucune") }}
                  </p>
                  <jeton-limitation
                    v-for="l in limitations"
                    :key="l"
                    :limitation="l"
                  />
                </v-card>
              </div>
              <div class="text-center">
                <v-btn
                  class="mx-auto mt-3"
                  outlined
                  small
                  :disabled="!lienLicenceValid"
                  @click="ouvrirLienLicence"
                >
                  <v-icon left>mdi-scale-balance</v-icon>
                  <div v-if="lienLicenceValid">
                    {{ $t("licences.lire") }}
                    <v-icon right>mdi-open-in-new</v-icon>
                  </div>
                  <div v-else>{{ $t("licences.aucunLien") }}</div>
                </v-btn>
              </div>
            </v-card>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="4">
          <div class="pa-4 text-center">
            <v-img
              class="mb-4"
              contain
              height="128"
              :src="image('logoBD')"
            ></v-img>
            <h3 class="title font-weight-light mb-2">
              {{ $t("bd.nouvelle.உறுதிப்படுத்தவும்") }}
            </h3>
            <p class="text--disabled text-left">
              <v-icon>mdi-alert-circle-outline</v-icon>
              {{ $t("bd.nouvelle.பகிர_வேண்டாம்") }}
            </p>
            <div class="mx-auto">
              <v-checkbox
                v-model="jaiCompris"
                class="mx-auto"
                :label="$t('bd.nouvelle.compris')"
              />
            </div>

            <v-btn
              :loading="enCréation"
              tiled
              outlined
              color="primary"
              :disabled="!jaiCompris"
              @click="(e) => créerBd(e)"
            >
              {{ $t("bd.nouvelle.வெல்வோம்") }}
            </v-btn>
          </div>
        </v-window-item>
      </v-window>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn :disabled="étape === 1" text @click="étape--">
          {{ $t("bd.nouvelle.Retour") }} </v-btn>
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
    </v-card>
  </v-container>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { licences, infoLicences, catégories } from "@constl/ipa/lib/licences";
import mixinLangues from "@/mixins/langues";
import mixinImages from "@/mixins/images";
import mixinLicences from "@/mixins/licences";
import mixinIPA from "@/mixins/ipa";

import itemNom from "@/components/commun/boîteNoms/itemNom.vue";
import itemNouveauNom from "@/components/commun/boîteNoms/itemNouveauNom.vue";
import jetonDroit from "@/components/commun/licences/jetonDroit.vue";
import jetonLimitation from "@/components/commun/licences/jetonLimitation.vue";
import jetonCondition from "@/components/commun/licences/jetonCondition.vue";

export default mixins(
  mixinLangues,
  mixinImages,
  mixinLicences,
  mixinIPA
).extend({
  name: "NouvelleBD",
  components: {
    itemNom,
    itemNouveauNom,
    jetonDroit,
    jetonCondition,
    jetonLimitation,
  },
  mixins: [mixinLangues, mixinImages, mixinLicences],
  data: function () {
    return {
      étape: 1,
      licences: [...licences] as string[],
      licence: null as null | string,
      noms: {} as { [key: string]: string },
      descriptions: {} as { [key: string]: string },
      enCréation: false,
      jaiCompris: false,
      licencesSpécilisées: false,
    };
  },
  computed: {
    petitPousset: function (): {
      text: string;
      href?: string;
      disabled?: boolean;
    }[] {
      return [
        { text: "Données", href: "/bd" },
        { text: this.$t("bd.nouvelle.petitPousset") as string, disabled: true },
      ];
    },
    titrePrésent: function (): string {
      switch (this.étape) {
        case 1:
          return this.$t("bd.nouvelle.தேர்ந்தெடுக்கவும்") as string;
        case 2:
          return this.$t("bd.nouvelle.காண்பிக்க") as string;
        case 3:
          return this.$t("bd.nouvelle.தேர்வுசெய்க") as string;
        default:
          return "";
      }
    },

    itemsLicences: function () {
      const licencesFinales: {
        header?: string;
        divider?: boolean;
        value?: string;
        text?: string;
      }[] = [{ header: this.$t("bd.nouvelle.Licences") as string }, { divider: true }];
      const licences: string[] = this.licences.filter((l: string) =>
        this.licencesSpécilisées ? true : !infoLicences[l].spécialisée
      );

      const générerÉléments = (
        liste: string[]
      ): { value: string; text: string }[] => {
        return liste.map((l) => {
          return {
            value: l,
            text: (this.$t(`licences.info.${l}.nom`) as string) || l,
          };
        });
      };

      const licencesBD = licences.filter(
        (l) => infoLicences[l].catégorie === catégories.BD
      );

      licencesFinales.push(...générerÉléments(licencesBD));

      const licencesCode = licences.filter(
        (l) => infoLicences[l].catégorie === catégories.CODE
      );
      if (licencesCode.length) {
        licencesFinales.push({
          header: this.$t("bd.nouvelle.logiciels") as string,
        });
        licencesFinales.push({ divider: true });
        licencesFinales.push(...générerÉléments(licencesCode));
      }

      const licencesArtistiques = licences.filter(
        (l) => infoLicences[l].catégorie === catégories.ART
      );
      if (licencesArtistiques.length) {
        licencesFinales.push({
          header: "Licences artistiques (non recommendées)",
        });
        licencesFinales.push({ divider: true });
        licencesFinales.push(...générerÉléments(licencesArtistiques));
      }

      const licencesAutres = licences.filter(
        (l) => infoLicences[l].catégorie === catégories.AUTRE
      );
      if (licencesAutres.length) {
        licencesFinales.push({ header: "Autres licences (non recommendées)" });
        licencesFinales.push({ divider: true });
        licencesFinales.push(...générerÉléments(licencesAutres));
      }

      return licencesFinales;
    },
  },
  methods: {
    sauvegarderNom: function ({
      langue,
      nom,
    }: {
      langue: string;
      nom: string;
    }) {
      this.noms = { ...this.noms, [langue]: nom };
    },
    effacerNom: function ({ langue }: { langue: string }) {
      this.noms = Object.fromEntries(
        Object.keys(this.noms)
          .filter((x) => x !== langue)
          .map((x) => [x, this.noms[x]])
      );
    },
    changerLangueNom: function ({
      langueOriginale,
      langue,
      nom,
    }: {
      langueOriginale: string;
      langue: string;
      nom: string;
    }) {
      this.effacerNom({ langue: langueOriginale });
      this.sauvegarderNom({ langue, nom });
    },
    sauvegarderDescr: function ({
      langue,
      nom,
    }: {
      langue: string;
      nom: string;
    }) {
      this.descriptions = { ...this.descriptions, [langue]: nom };
    },
    effacerDescr: function ({ langue }: { langue: string }): void {
      this.descriptions = Object.fromEntries(
        Object.keys(this.descriptions)
          .filter((x) => x !== langue)
          .map((x) => [x, this.descriptions[x]])
      );
    },

    changerLangueDescr: function ({
      langueOriginale,
      langue,
      nom,
    }: {
      langueOriginale: string;
      langue: string;
      nom: string;
    }) {
      this.effacerDescr({ langue: langueOriginale });
      this.sauvegarderDescr({ langue, nom });
    },

    créerBd: async function () {
      if (!this.licence) return;
      this.enCréation = true;

      const id = await this.$ipa.bds!.créerBd(this.licence);
      if (Object.keys(this.noms).length) {
        await this.$ipa.bds!.ajouterNomsBd(id, this.noms);
      }
      if (Object.keys(this.descriptions).length) {
        await this.$ipa.bds!.ajouterDescriptionsBd(id, this.descriptions);
      }

      //On ajoute la nouvelle BD aux favoris automatiquement
      await this.$ipa.favoris!.épinglerFavori(id);

      this.enCréation = false;
      this.$router.push(`/bd/visualiser/${encodeURIComponent(id)}`);
    },
  },
});
</script>

<style></style>
