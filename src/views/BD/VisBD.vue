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
      <v-img :src="logoBD" height="100px" contain />
      <v-card-title>
        {{ couper(nom, 40) }}

        <span v-if="permissionÉcrire">
          <v-menu
            offset-x
            :close-on-content-click="false"
            transition="slide-y-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-on="on" v-bind="attrs">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <boîteNoms
              :noms="nomsBD"
              sousTitre="bd.vis.boîteNoms.sousTitre"
              @sauvegarder="sauvegarderNom"
              @changerLangue="changerLangueNom"
              @effacer="effacerNom"
            />
          </v-menu>

          <v-btn icon small>
            <v-icon small>mdi-camera-outline</v-icon>
          </v-btn>
        </span>
        <span>
          <lien-orbite :lien="idBD" />
        </span>
        <v-spacer />
        <span>
          <lienTélécharger :lien="idBD" />
        </span>

        <v-dialog v-if="permissionÉcrire" v-model="dialogue" width="500">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon color="error">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>

          <v-card>
            <v-card-title class="headline red--text">
              Voulez-vous vraiment effacer cette base de données ?
            </v-card-title>

            <v-card-text>
              Ceci enlevera la base de données de votre dispositif. Elle
              n'effacera pas des copies que d'autres utilisatrices et
              utilisateurs de Constellation pourraient avoir créées.
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text outlined @click="dialogue = false">
                Non !
              </v-btn>
              <v-btn color="error" depressed @click="effacerBd">
                Oui, effacer
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-title>
      <v-card-subtitle>
        <span v-if="this.descriptions">
          {{ descriptions }}
        </span>
        <span v-else-if="permissionÉcrire"> Aucune description. </span>
        <v-menu
          v-if="permissionÉcrire"
          offset-x
          :close-on-content-click="false"
          transition="slide-y-transition"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small v-on="on" v-bind="attrs">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <boîteNoms
            :noms="descriptionsBD"
            titre="bd.vis.boîteDescr.titre"
            @sauvegarder="sauvegarderDescr"
            @changerLangue="changerLangueDescr"
            @effacer="effacerDescr"
          />
        </v-menu>
      </v-card-subtitle>

      <v-divider />
      <v-card-text>
        <v-card flat class="mx-3 mb-3">
          <p class="mb-0 text-overline">Information Générale</p>
          <div class="d-flex flex-wrap">
            <v-card flat width="200" class="mb-3">
              <v-menu
                offset-x
                :disabled="score === null"
                :close-on-content-click="false"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item v-bind="attrs" v-on="on">
                    <v-list-item-avatar>
                      <v-progress-circular
                        :rotate="score ? 270 : undefined"
                        :width="5"
                        :value="score && score.total ? score.total : 0"
                        :indeterminate="!score"
                        :color="
                          score ? couleurScore(score.total).couleur : 'primary'
                        "
                      >
                        {{ score ? score.total : "" }}
                      </v-progress-circular>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      Score de qualité
                      <span
                        v-if="score"
                        :style="`color:${couleurScore(score.total).couleur}`"
                        class="font-weight-bold"
                      >
                        {{ couleurScore(score.total).note }}
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                </template>
                <carteQualité
                  v-if="score"
                  :score="score"
                  :permissionÉcrire="permissionÉcrire"
                />
              </v-menu>
            </v-card>
            <v-card flat width="200" class="mb-3">
              <v-menu offset-x :disabled="!score">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item v-bind="attrs" v-on="on">
                    <v-list-item-avatar>
                      <v-icon>mdi-account-multiple</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content> Auteurs </v-list-item-content>
                  </v-list-item>
                </template>
                <v-list v-if="auteurs">
                  <v-subheader>Contributeurs Constellation</v-subheader>
                  <v-list-item
                    v-for="a in auteurs.auteurs"
                    :key="a"
                    @click="$router.push(`/auteur/${a}`)"
                  >
                    <v-list-item-avatar> </v-list-item-avatar>
                    <v-list-item-content>
                      {{ a }}
                    </v-list-item-content>
                  </v-list-item>
                  <v-subheader v-if="auteurs.sources.length"
                    >Sources des données</v-subheader
                  >
                  <v-list-item v-for="s in auteurs.sources" :key="s">
                    <v-list-item-avatar> </v-list-item-avatar>
                    <v-list-item-content>
                      {{ s }}
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-card>
            <v-card flat width="200" class="mb-3">
              <v-list-item
                v-if="licence !== null"
                @click="
                  licenceApprouvée
                    ? ouvrirLien($t(`licences.${licence}.lien`))
                    : ''
                "
              >
                <v-list-item-avatar>
                  <v-icon
                    left
                    :color="licenceApprouvée ? 'secondary' : 'error'"
                  >
                    {{ licence ? "mdi-scale-balance" : "mdi-alert-outline" }}
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  {{
                    licence && !licenceApprouvée
                      ? licence
                      : $t(`licences.${licence || "introuvable"}.nom`)
                  }}
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon>mdi-open-in-new</v-icon>
                </v-list-item-action>
              </v-list-item>
            </v-card>
            <v-list-item @click="ouvrirRéplications;">
              <v-list-item-avatar>
                <v-icon left> mdi-plus </v-icon>
              </v-list-item-avatar>
              <v-list-item-content> 3 réplications </v-list-item-content>
            </v-list-item>
          </div>
        </v-card>
        <v-card flat class="mx-3 mb-3">
          <div class="d-flex flex-wrap">
            <v-card flat min-width="200" max-width="350" class="mb-3">
              <p class="mb-0 text-overline">Variables</p>
              <p v-if="!variables.length" class="text--disabled">
                Aucune variable
              </p>
              <jeton-variable v-for="id in variables" :key="id" :id="id" />
            </v-card>
            <v-card flat min-width="200" max-width="350" class="mb-3">
              <p class="mb-0 text-overline">
                Mots-clefs
                <v-btn v-if="permissionÉcrire" small icon>
                  <v-icon small> mdi-plus </v-icon>
                </v-btn>
              </p>
              <p v-if="!motsClefs.length" class="text--disabled">
                Aucun mot clef
              </p>
              <v-chip
                v-for="m in motsClefs"
                :key="m"
                :close="permissionÉcrire"
                outlined
                small
                label
                class="mx-1 my-1"
                close-icon="mdi-close"
                >{{ m }}</v-chip
              >
            </v-card>
            <v-card flat min-width="200" max-width="350" class="mb-3">
              <p class="mb-0 text-overline">Géographie</p>
              <p v-if="!géog.length" class="text--disabled">
                Aucune région détectée
              </p>
              <v-chip
                v-for="m in géog"
                :key="m"
                outlined
                small
                label
                class="mx-1 my-1"
                >{{ m }}</v-chip
              >
            </v-card>
          </div>
        </v-card>
        <v-list>
          <p class="mb-0 text-overline">
            Intégrations
            <v-btn icon small @click="ajouterIntégration;">
              <v-icon small>mdi-plus</v-icon>
            </v-btn>
          </p>
          <v-divider />
          <v-list>
            <itemIntégration v-for="x in [0, 1, 2, 3]" :key="x" />
          </v-list>

          <p class="mb-0 text-overline">
            Tableaux
            <v-btn v-if="permissionÉcrire" icon small @click="ajouterTableau">
              <v-icon small>mdi-plus</v-icon>
            </v-btn>
          </p>
          <v-divider />
          <v-skeleton-loader v-if="tableaux === null" type="paragraph" />
          <div v-else-if="!tableaux.length" class="text-center">
            <p class="text-h5 mt-5">Il n'y a aucun tableau pour l'instant</p>
            <v-img :src="image('vide')" class="my-5" contain height="175px" />

            <v-btn
              v-if="permissionÉcrire"
              color="primary"
              class="mx-2"
              outlined
              text
              @click="ajouterTableau"
            >
              Ajouter un tableau
            </v-btn>
            <v-btn
              v-if="permissionÉcrire"
              color="primary"
              class="mx-2"
              outlined
              text
              @click="importer"
            >
              Importer des données
            </v-btn>
          </div>
          <transition-group
            v-else
            name="fade"
            mode="out-in"
            class="d-flex flex-wrap justify-center"
          >
            <item-tableau
              v-for="t in tableaux"
              :key="t"
              :id="t"
              :idBD="idBD"
              @click="
                $router.push(
                  `/bd/visualiser/${encodeURIComponent(
                    idBD
                  )}/tableau/${encodeURIComponent(t)}`
                )
              "
            />
          </transition-group>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { traduireNom, couper, couleurScore, ouvrirLien } from "@/utils";
import { licences } from "@/ipa/licences";

import boîteNoms from "@/components/commun/boîteNoms/boîte";
import itemTableau from "@/components/BD/itemTableau";
import itemIntégration from "@/components/BD/itemIntégration";
import lienOrbite from "@/components/commun/lienOrbite";
import lienTélécharger from "@/components/commun/lienTélécharger";
import mixinImage from "@/mixins/images";
import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";
import jetonVariable from "@/components/commun/jetonVariable";
import carteQualité from "@/components/commun/carteQualité";

export default {
  name: "visBD",
  components: {
    itemTableau,
    itemIntégration,
    lienOrbite,
    lienTélécharger,
    jetonVariable,
    carteQualité,
    boîteNoms,
  },
  mixins: [mixinImage, mixinLangues, mixinIPA],
  data: function () {
    return {
      dialogue: false,
      licence: null,
      descriptionsBD: {},
      nomsBD: {},
      permissionÉcrire: false,
      tableaux: null,
      logo: null,
      score: null,
      variables: [],

      géog: [],
      motsClefs: [],
      auteurs: null,
    };
  },
  computed: {
    langues: function () {
      return [this.$i18n.locale, ...this.$i18n.fallbackLocale];
    },
    nom: function () {
      return Object.keys(this.nomsBD).length
        ? traduireNom(this.nomsBD, this.langues)
        : this.idBD;
    },
    descriptions: function () {
      return traduireNom(this.descriptionsBD, this.langues);
    },
    idBD: function () {
      return decodeURIComponent(this.$route.params.id);
    },
    petitPousset: function () {
      return [
        { text: "Données", href: "/bd" },
        { text: couper(this.nom, 35), disabled: true },
      ];
    },
    licenceApprouvée: function () {
      return licences.includes(this.licence);
    },
    logoBD: function () {
      return this.logo || this.image("logoBD");
    },
  },
  methods: {
    couper,
    couleurScore,
    ouvrirLien,
    ajouterTableau: async function () {
      await this.$ipa.bds.ajouterTableauBD(this.idBD);
    },
    initialiserSuivi: async function () {
      this.permissionÉcrire = await this.$ipa.permissionÉcrire(this.idBD);

      const oublierLicence = await this.$ipa.bds.suivreLicence(
        this.idBD,
        (licence) => {
          this.licence = licence;
        }
      );
      const oublierNoms = await this.$ipa.bds.suivreNomsBd(
        this.idBD,
        (noms) => {
          this.nomsBD = noms;
        }
      );
      const oublierDescriptions = await this.$ipa.bds.suivreDescrBd(
        this.idBD,
        (descriptions) => {
          this.descriptionsBD = descriptions;
        }
      );
      const oublierTableaux = await this.$ipa.bds.suivreTableauxBd(
        this.idBD,
        (tableaux) => {
          this.tableaux = tableaux;
        }
      );
      const oublierScore = await this.$ipa.bds.suivreScoreBd(
        this.idBD,
        (score) => (this.score = score)
      );
      const oublierVariables = await this.$ipa.bds.suivreVariablesBd(
        this.idBD,
        (variables) => (this.variables = variables)
      );
      this.suivre([
        oublierLicence,
        oublierNoms,
        oublierDescriptions,
        oublierTableaux,
        oublierScore,
        oublierVariables,
      ]);
    },
    effacerBd: async function () {
      await this.$ipa.bds.effacerBd(this.idBD);
      this.$router.push("/bd");
    },
    sauvegarderNom({ langue, nom }) {
      this.$ipa.bds.sauvegarderNomBD(this.idBD, langue, nom);
    },
    changerLangueNom({ langueOriginale, langue, nom }) {
      this.$ipa.compte.effacerNomBd(this.idBD, langueOriginale);
      this.$ipa.compte.sauvegarderNomBD(this.idBD, langue, nom);
    },
    effacerNom({ langue }) {
      this.$ipa.compte.effacerNomBd(this.idBD, langue);
    },
    sauvegarderDescr({ langue, nom }) {
      this.$ipa.bds.sauvegarderDescrBd(this.idBD, langue, nom);
    },
    changerLangueDescr({ langueOriginale, langue, nom }) {
      this.$ipa.compte.effacerDescrBD(langueOriginale);
      this.$ipa.compte.sauvegarderDescrBd(langue, nom);
    },
    effacerDescr({ langue }) {
      this.$ipa.compte.effacerDescrBD(langue);
    },
  },
};
</script>

<style></style>
