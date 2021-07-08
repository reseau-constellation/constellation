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
          <lien-orbite :lien="idBd" />
        </span>
        <v-spacer />
        <span>
          <lienTélécharger :lien="idBd" />
        </span>

        <v-dialog v-if="permissionÉcrire" v-model="dialogueEffacerBd" width="500">
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
              <v-btn color="error" text outlined @click="dialogueEffacerBd = false">
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
              <v-menu offset-x :disabled="!score" >
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
              <dialogue-licence
                :licence="licence"
                :permissionModifier="permissionÉcrire"
                @changerLicence="changerLicence"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item v-bind="attrs" v-on="on" v-show="licence !== null">
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
                        couper(
                          licence && !licenceApprouvée
                            ? licence
                            : $t(`licences.info.${licence || "introuvable"}.abr`),
                            10
                          )
                      }}
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </dialogue-licence>
            </v-card>
            <v-card flat width="200" class="mb-3">
              <v-list-item @click="ouvrirRéplications;">
                <v-list-item-avatar>
                  <v-icon left> mdi-plus </v-icon>
                </v-list-item-avatar>
                <v-list-item-content> 3 réplications </v-list-item-content>
              </v-list-item>
            </v-card>
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
              :idBD="idBd"
              @click="
                $router.push(
                  `/bd/visualiser/${encodeURIComponent(
                    idBd
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

import dialogueLicence from "@/components/commun/licences/dialogueLicence";
import boîteNoms from "@/components/commun/boîteNoms/boîte";
import itemTableau from "@/components/BD/itemTableau";
import lienOrbite from "@/components/commun/lienOrbite";
import lienTélécharger from "@/components/commun/lienTélécharger";
import mixinImage from "@/mixins/images";
import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";
import mixinLicences from "@/mixins/licences";
import jetonVariable from "@/components/commun/jetonVariable";
import carteQualité from "@/components/commun/carteQualité";

export default {
  name: "visBD",
  components: {
    itemTableau,
    lienOrbite,
    lienTélécharger,
    jetonVariable,
    carteQualité,
    dialogueLicence,
    boîteNoms,
  },
  mixins: [mixinImage, mixinLangues, mixinIPA, mixinLicences],
  data: function () {
    return {
      dialogueEffacerBd: false,
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
        : this.idBd;
    },
    descriptions: function () {
      return traduireNom(this.descriptionsBD, this.langues);
    },
    idBd: function () {
      return decodeURIComponent(this.$route.params.id);
    },
    petitPousset: function () {
      return [
        { text: "Données", href: "/bd" },
        { text: couper(this.nom, 35), disabled: true },
      ];
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
      await this.$ipa.bds.ajouterTableauBD(this.idBd);
    },
    initialiserSuivi: async function () {
      this.permissionÉcrire = await this.$ipa.permissionÉcrire(this.idBd);

      const oublierLicence = await this.$ipa.bds.suivreLicence(
        this.idBd,
        (licence) => {
          this.licence = licence;
        }
      );
      const oublierNoms = await this.$ipa.bds.suivreNomsBd(
        this.idBd,
        (noms) => {
          this.nomsBD = noms;
        }
      );
      const oublierDescriptions = await this.$ipa.bds.suivreDescrBd(
        this.idBd,
        (descriptions) => {
          this.descriptionsBD = descriptions;
        }
      );
      const oublierTableaux = await this.$ipa.bds.suivreTableauxBd(
        this.idBd,
        (tableaux) => {
          this.tableaux = tableaux;
        }
      );
      const oublierScore = await this.$ipa.bds.suivreScoreBd(
        this.idBd,
        (score) => (this.score = score)
      );
      const oublierVariables = await this.$ipa.bds.suivreVariablesBd(
        this.idBd,
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
      await this.$ipa.bds.effacerBd(this.idBd);
      this.$router.push("/bd");
    },
    sauvegarderNom({ langue, nom }) {
      this.$ipa.bds.sauvegarderNomBd(this.idBd, langue, nom);
    },
    changerLangueNom({ langueOriginale, langue, nom }) {
      this.$ipa.bds.effacerNomBd(this.idBd, langueOriginale);
      this.$ipa.bds.sauvegarderNomBd(this.idBd, langue, nom);
    },
    effacerNom({ langue }) {
      this.$ipa.bds.effacerNomBd(this.idBd, langue);
    },
    sauvegarderDescr({ langue, nom }) {
      this.$ipa.bds.sauvegarderDescrBd(this.idBd, langue, nom);
    },
    changerLangueDescr({ langueOriginale, langue, nom }) {
      this.$ipa.bds.effacerDescrBd(this.idBd, langueOriginale);
      this.$ipa.bds.sauvegarderDescrBd(this.idBd, langue, nom);
    },
    effacerDescr({ langue }) {
      this.$ipa.bds.effacerDescrBd(this.idBd, langue);
    },
    changerLicence({ licence }) {
      this.$ipa.bds.changerLicenceBd(this.idBd, licence)
    }
  },
};
</script>

<style></style>
