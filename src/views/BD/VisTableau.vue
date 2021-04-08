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
      <v-img
        :src="logo || require('@/assets/undraw/undraw_Projections_re_1mrh.svg')"
        height="100px"
        contain
      ></v-img>
      <v-card-title>
        {{ couper(nom, 45) }}
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
              :noms="nomsTableau"
              sousTitre="bd.vis.boîteNoms.sousTitre"
              @sauvegarder="sauvegarderNom"
              @changerLangue="changerLangueNom"
              @effacer="effacerNom"
            />
          </v-menu>
        </span>
        <lien-orbite :lien="idBD" />

        <v-spacer />
        <lienTélécharger :lien="idBD" />
      </v-card-title>
      <v-divider />

      <v-card-text>
        <p class="mb-0 text-overline">
          Données
          <v-menu
            offset-x
            :close-on-content-click="false"
            transition="slide-y-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-on="on" v-bind="attrs">
                <v-icon small>mdi-table-column-plus-after</v-icon>
              </v-btn>
            </template>
            <v-card width="300px">
              <v-card-title>Ajoutez une colonne</v-card-title>
              <v-divider />
              <v-card-text>
                <v-combobox outlined dense label="Variable" />
                <v-text-field outlined dense label="Unités" />
              </v-card-text>

              <v-card-actions>
                <v-spacer />
                <v-btn text outlined color="primary">
                  Confirmer
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
          <v-menu
            offset-x
            :close-on-content-click="false"
            transition="slide-y-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-on="on" v-bind="attrs" :disabled="colonnes && !colonnes.length">
                <v-icon small>mdi-table-row-plus-after</v-icon>
              </v-btn>
            </template>
            <v-card width="300px">
              <v-card-title>Ajoutez une colonne</v-card-title>
              <v-divider />
              <v-card-text>
                <v-combobox outlined dense label="Variable" />
                <v-text-field outlined dense label="Unités" />
              </v-card-text>

              <v-card-actions>
                <v-spacer />
                <v-btn text outlined color="primary">
                  Confirmer
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </p>

        <v-divider />
        <v-skeleton-loader v-if="colonnes === null" type="image" />
        <v-data-table v-else :headers="entête" :items="données" dense>
          <template v-slot:no-data>
            {{ $t("tableau.vide") }}
          </template>
          <template
            v-for="c in entête"
            v-slot:[`header.${c.value}`]="{ header }"
          >
            <span :key="c.value" @click.stop>
              <v-icon x-small>mdi-information-outline</v-icon>
              {{ header.text }}
            </span>
          </template>
          <template v-for="c in entête" v-slot:[`item.${c.value}`]="{ item }">
            <span v-if="c.value === 'date'" :key="c.value">
              {{ new Date(item[c.value]).toLocaleDateString($i18n.locale) }}
            </span>
            <span v-else :key="c.value">
              {{ formatterChiffre(item[c.value]) }}
            </span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { obtTableau, obtDonnéesTableau, obtVarsTableau } from "@/ipa/tableaux";
import { traduireNom } from "@/utils";
import { couper } from "@/utils";

import boîteNoms from "@/components/commun/boîteNoms/boîte";
import lienOrbite from "@/components/commun/lienOrbite";
import lienTélécharger from "@/components/commun/lienTélécharger";
import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";

export default {
  name: "visTableau",
  components: { lienOrbite, lienTélécharger, boîteNoms },
  mixins: [mixinLangues, mixinIPA],
  data: function() {
    return {
      permissionÉcrire: false,
      nomsTableau: {},
      nomsBD: {},
      logo: null,
      colonnes: null,

      données: [],
      entête: []
    };
  },
  computed: {
    langues: function() {
      return [this.$i18n.locale, ...this.$i18n.fallbackLocale];
    },
    nom: function() {
      return Object.keys(this.nomsTableau).length
        ? traduireNom(this.nomsTableau, this.langues)
        : this.idTableau;
    },
    nomBD: function() {
      return Object.keys(this.nomsBD).length
        ? traduireNom(this.nomsBD, this.langues)
        : this.idBD;
    },
    idBD: function() {
      return decodeURIComponent(this.$route.params.id);
    },
    idTableau: function() {
      return decodeURIComponent(this.$route.params.idTableau);
    },
    petitPousset: function() {
      return [
        { text: "Données", href: "/bd" },
        {
          text: couper(this.nomBD, 15),
          href: `/bd/visualiser/${encodeURIComponent(this.idBD)}`
        },
        {
          text: couper(this.nom, 15),
          disabled: true
        }
      ];
    }
  },
  methods: {
    couper,
    sauvegarderNom({ langue, nom }) {
      this.$ipa.tableaux.sauvegarderNomTableau(this.idTableau, langue, nom);
    },
    changerLangueNom({ langueOriginale, langue, nom }) {
      this.$ipa.tableaux.effacerNomTableau(this.idTableau, langueOriginale);
      this.$ipa.tableaux.sauvegarderNomTableau(this.idTableau, langue, nom);
    },
    effacerNom({ langue }) {
      this.$ipa.tableaux.effacerNomTableau(this.idTableau, langue);
    },
    initialiserSuivi: async function() {
      this.permissionÉcrire = await this.$ipa.permissionÉcrire(this.idTableau);

      const oublierNoms = await this.$ipa.tableaux.suivreNomsTableau(
        this.idTableau,
        noms => {
          this.nomsTableau = noms;
        }
      );

      const oublierNomsBD = await this.$ipa.bds.suivreNomsBD(
        this.idBD,
        noms => {
          this.nomsBD = noms;
        }
      );

      const oublierColonnes = await this.$ipa.tableaux.suivreColonnes(
        this.idTableau,
        cols => {
          console.log({ cols });
          this.colonnes = cols;
        }
      );

      this.suivre([oublierNoms, oublierNomsBD, oublierColonnes]);
    }
  }
};
</script>

<style></style>
