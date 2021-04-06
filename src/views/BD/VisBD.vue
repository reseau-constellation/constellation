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
        <lien-orbite :lien="idBD" />

        <span v-if="permissionÉcrire">
          <v-btn icon>
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>mdi-camera-outline</v-icon>
          </v-btn>
        </span>
        <v-spacer />

        <lienTélécharger :lien="idBD" />
        <v-btn v-show="permissionÉcrire" icon color="error">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle v-if="this.détails">{{ détails }}</v-card-subtitle>

      <v-divider />
      <v-card-text>
        <div class="d-flex flex-wrap">
          <v-card flat width="250" class="mx-3 mb-3">
            <p class="mb-0 text-overline">Information</p>
            <v-list>
              <v-menu
                offset-x
                :disabled="!score"
                :close-on-content-click="false"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item v-bind="attrs" v-on="on">
                    <v-list-item-avatar>
                      <v-progress-circular
                        :rotate="score ? 270 : undefined"
                        :width="5"
                        :value="score ? score.total : undefined"
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
              <v-menu offset-x :disabled="!score">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item v-bind="attrs" v-on="on">
                    <v-list-item-avatar>
                      <v-icon>mdi-account-multiple</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      Auteurs
                    </v-list-item-content>
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
            </v-list>
          </v-card>
          <v-card flat width="250" class="mx-3 mb-3">
            <p class="mb-0 text-overline">Variables</p>
            <jeton-variable v-for="id in variables" :key="id" :id="id" />
          </v-card>
          <v-card flat width="250" class="mx-3 mb-3">
            <p class="mb-0 text-overline">Mots-clefs</p>
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
            <v-chip
              v-if="permissionÉcrire"
              small
              outlined
              label
              class="mx-1 my-1"
            >
              <v-icon>
                mdi-plus
              </v-icon>
            </v-chip>
          </v-card>
          <v-card flat width="250" class="mx-3 mb-3">
            <p class="mb-0 text-overline">Géographie</p>
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

        <v-list>
          <p class="mb-0 text-overline">Contrôle de qualité</p>
          <v-divider />
          <v-expansion-panels class="mt-3">
            <v-expansion-panel v-for="(item, i) in 5" :key="i">
              <v-expansion-panel-header>
                Item
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-list>

        <v-list>
          <p class="mb-0 text-overline">Intégrations</p>
          <v-divider />
          <transition-group
            name="fade"
            mode="out-in"
            class="d-flex flex-wrap justify-center"
          >
          </transition-group>
        </v-list>

        <v-list>
          <p class="mb-0 text-overline">Tableaux</p>
          <v-divider />
          <transition-group
            name="fade"
            mode="out-in"
            class="d-flex flex-wrap justify-center"
          >
            <item-tableau
              v-for="t in tableaux"
              :key="t"
              :id="t"
              @click="$router.push(`/bd/visualiser/${idBD}/tableau/${t}`)"
            />
          </transition-group>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import {
  obtTableauxBD,
  permissionÉcrire,
  obtVarsBD,
  obtNomsBD,
  BDParId,
  obtScoreBD,
  obtAuteursBD
} from "@/ipa/bds";
import { traduireNom, couper, couleurScore, ouvrirLien } from "@/utils";
import { licences } from "@/ipa/licences";

import itemTableau from "@/components/BD/itemTableau";
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
    lienOrbite,
    lienTélécharger,
    jetonVariable,
    carteQualité
  },
  mixins: [mixinImage, mixinLangues, mixinIPA],
  data: function() {
    return {
      licence: null,
      détailsBD: {},
      nomsBD: {},
      permissionÉcrire: false,

      logo: null,
      tableaux: undefined,
      variables: [],
      géog: ["தமிழ்நாடு", "கோயம்புத்தூர்"],
      motsClefs: ["géographie", "hydrologie"],
      auteurs: null,

      score: null
    };
  },
  computed: {
    langues: function() {
      return [this.$i18n.locale, ...this.$i18n.fallbackLocale];
    },
    nom: function() {
      return Object.keys(this.nomsBD).length ? traduireNom(this.nomsBD, this.langues) : this.idBD;
    },
    détails: function() {
      return traduireNom(this.détailsBD, this.langues)
    },
    idBD: function() {
      return decodeURIComponent(this.$route.params.id);
    },
    petitPousset: function() {
      return [
        { text: "Données", href: "/bd" },
        { text: couper(this.nom, 35), disabled: true }
      ];
    },
    licenceApprouvée: function() {
      return licences.includes(this.licence);
    },
    logoBD: function() {
      return this.logo || this.image("logoBD");
    }
  },
  methods: {
    couper,
    couleurScore,
    ouvrirLien,
    initialiserSuivi: async function() {
      this.permissionÉcrire = await this.$ipa.permissionÉcrire(this.idBD)

      const oublierLicence = await this.$ipa.bds.suivreLicence(
        this.idBD,
        licence => {
          this.licence = licence;
        }
      );
      const oublierNoms = await this.$ipa.bds.suivreNomsBD(
        this.idBD,
        noms => {
          this.nomsBD = noms;
        });
      const oublierDétails = await this.$ipa.bds.suivreDescrBD(
        this.idBD,
        détails => {
          this.détailsBD = détails;
        });
      this.suivre([oublierLicence, oublierNoms, oublierDétails]);
    }
  }
};
</script>

<style></style>
