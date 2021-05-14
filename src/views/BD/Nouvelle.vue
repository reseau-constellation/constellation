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
              Ne vous cassez pas la tête ; ces noms pouront être modifiés
              ensuite.
            </span>
            <v-list style="max-height: 300px" class="overflow-y-auto">
              <item-nouveau-nom
                :languesExistantes="Object.keys(this.noms)"
                etiquetteNom="Nom de la BD"
                etiquetteLangue="Langue"
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
              Quelque chose de claire, net et précis !
            </span>
            <v-list style="max-height: 300px" class="overflow-y-auto">
              <item-nouveau-nom
                :languesExistantes="Object.keys(this.descriptions)"
                etiquetteNom="Description"
                etiquetteLangue="Langue"
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
              Ça vaut la peine de prendre son temps. Vous pouvez changer d'avis
              plus tard, mais vous ne pouvez pas révoquer les droits déjà
              octroyés aux autres utilisateurs et utilisatrices pour les données
              déjà publiées.
            </p>
            <v-select
              v-model="licence"
              :items="
                licences.map(l => {
                  return { value: l, text: $t(`licences.${l}.nom`) };
                })
              "
              label="Licence"
              outlined
              dense
              :append-outer-icon="licence ? 'mdi-information' : ''"
              @click:append-outer="ouvrirLienLicence"
            />
            <v-card flat class="mx-3 mb-3">
              <p>
                Ce qui suit n'est qu'un résumé de la licence et n'est pas un
                avis légal.
              </p>
              <div class="d-flex flex-wrap">
                <v-card flat min-width="200" max-width="350" class="mb-3 mx-2">
                  <p class="mb-0 text-overline">Permissions</p>
                  <p v-if="!permissions.length" class="text--disabled">
                    Aucune permission
                  </p>
                  <v-chip
                    v-for="p in permissions"
                    :key="p"
                    outlined
                    small
                    label
                    class="mx-1 my-1"
                  >
                    <v-icon small left color="success">mdi-check</v-icon>
                    {{ p }}
                  </v-chip>
                </v-card>
                <v-card flat min-width="200" max-width="350" class="mb-3">
                  <p class="mb-0 text-overline">
                    Conditions
                  </p>
                  <p v-if="!conditions.length" class="text--disabled">
                    Aucune condition
                  </p>
                  <v-chip
                    v-for="m in conditions"
                    :key="m"
                    outlined
                    small
                    label
                    class="mx-1 my-1"
                  >
                    <v-icon small left color="blue"
                      >mdi-information-outline</v-icon
                    >
                    {{ m }}
                  </v-chip>
                </v-card>
                <v-card flat min-width="200" max-width="350" class="mb-3">
                  <p class="mb-0 text-overline">Limitations</p>
                  <p v-if="!limitations.length" class="text--disabled">
                    Aucune limitation
                  </p>
                  <v-chip
                    v-for="l in limitations"
                    :key="l"
                    outlined
                    small
                    label
                    class="mx-1 my-1"
                  >
                    <v-icon small left color="error">mdi-close</v-icon>
                    {{ l }}
                  </v-chip>
                </v-card>
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
              Veuillez confirmer la création de la base de données afin de
              pouvoir commencer à y ajouter des données.
            </h3>
            <v-btn
              :loading="enCréation"
              tiled
              outlined
              color="primary"
              @click="e => créerBD(e)"
            >
              C'est parti !
            </v-btn>
          </div>
        </v-window-item>
      </v-window>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn :disabled="étape === 1" text @click="étape--">
          Retour
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="(étape === 3 && !licence) || étape === 4"
          color="primary"
          outlined
          @click="étape++"
        >
          Suivant
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { licences, infoLicences } from "@/ipa/licences";
import { ouvrirLien } from "@/utils";
import mixinLangues from "@/mixins/langues";
import mixinImages from "@/mixins/images";
import itemNom from "@/components/commun/boîteNoms/itemNom";
import itemNouveauNom from "@/components/commun/boîteNoms/itemNouveauNom";

export default {
  name: "NouvelleBD",
  components: { itemNom, itemNouveauNom },
  mixins: [mixinLangues, mixinImages],
  data: function() {
    return {
      étape: 1,
      licences,
      licence: null,
      noms: {},
      descriptions: {},
      enCréation: false,

      permissions: [],
      conditions: [],
      limitations: []
    };
  },
  computed: {
    petitPousset: function() {
      return [
        { text: "Données", href: "/bd" },
        { text: this.$t("bd.nouvelle.petitPousset"), disabled: true }
      ];
    },
    titrePrésent: function() {
      switch (this.étape) {
        case 1:
          return "Choisissez un nom";
        case 2:
          return "Ajoutez une description (optionnel)";
        case 3:
          return "Choisissez une licence";
        default:
          return "";
      }
    }
  },
  watch: {
    licence: function(val) {
      this.permissions = infoLicences[val].droits || [];
      this.conditions = infoLicences[val].conditions || [];
      this.limitations = infoLicences[val].limitations || [];
    }
  },
  methods: {
    sauvegarderNom: function({ langue, nom }) {
      this.noms = { ...this.noms, [langue]: nom };
    },
    effacerNom: function({ langue }) {
      this.noms = Object.fromEntries(
        Object.keys(this.noms)
          .filter(x => x !== langue)
          .map(x => [x, this.noms[x]])
      );
    },
    changerLangueNom: function({ langueOriginale, langue, nom }) {
      this.effacerNom(langueOriginale);
      this.sauvegarderNom(langue, nom);
    },
    sauvegarderDescr: function({ langue, nom }) {
      this.descriptions = { ...this.descriptions, [langue]: nom };
    },
    effacerDescr: function({ langue }) {
      this.descriptions = Object.fromEntries(
        Object.keys(this.descriptions)
          .filter(x => x !== langue)
          .map(x => [x, this.descriptions[x]])
      );
    },
    changerLangueDescr: function({ langueOriginale, langue, nom }) {
      this.effacerDescr(langueOriginale);
      this.sauvegarderDescr(langue, nom);
    },
    ouvrirLienLicence: function() {
      if (this.licence) {
        ouvrirLien(this.$t(`licences.${this.licence}.lien`));
      }
    },
    créerBD: async function() {
      this.enCréation = true;
      const id = await this.$ipa.bds.créerBD(this.licence);
      if (Object.keys(this.noms).length) {
        await this.$ipa.bds.ajouterNomsBD(id, this.noms);
      }
      if (Object.keys(this.descriptions).length) {
        await this.$ipa.bds.ajouterDescriptionsBD(id, this.descriptions);
      }
      this.$router.push(`/bd/visualiser/${encodeURIComponent(id)}`);
    }
  }
};
</script>

<style></style>
