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
              <v-btn
                icon
                v-on="on"
                v-bind="attrs"
                :disabled="!permissionÉcrire"
              >
                <v-icon small>mdi-table-column-plus-after</v-icon>
              </v-btn>
            </template>
            <carte-nouvelle-colonne @creerColonne="creerColonne" />
          </v-menu>
          <v-btn
            icon
            :disabled="!permissionÉcrire || (colonnes && !colonnes.length)"
            @click="actionNouvelleLigne"
          >
            <v-icon small>mdi-table-row-plus-after</v-icon>
          </v-btn>
        </p>

        <v-divider />
        <v-skeleton-loader v-if="colonnes === null" type="image" />
        <v-data-table v-else :headers="entête" :items="éléments" dense>
          <template v-slot:no-data>
            {{ $t("tableau.vide") }}
          </template>
          <template
            v-for="c in entête"
            v-slot:[`header.${c.value}`]="{ header }"
          >
            <titreEntêteTableau
              v-if="c.value !== 'actions'"
              :key="c.value"
              :idVariable="header.text"
              :idColonne="header.value"
            />
            <span v-else :key="c.value"> {{ c.text }} </span>
          </template>
          <template v-for="c in entête" v-slot:[`item.${c.value}`]="{ item }">
            <span v-if="c.value === 'actions'" :key="c.value">
              <v-btn icon small @click="éditerÉlément(item.empreinte)">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn v-if="item.empreinte === éditer" color="success" icon small @click="()=>sauvegarderÉlément()">
                <v-icon small>mdi-check</v-icon>
              </v-btn>
              <v-btn v-else color="error" icon small @click="()=>effacerÉlément(item.empreinte)">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </span>
            <celluleDate
              v-else-if="c.catégorie === 'date'"
              :key="c.value"
              :val="item[c.value]"
              :editer="item.empreinte === éditer"
            />
            <celluleNumérique
              v-else-if="c.catégorie === 'numérique'"
              :key="c.value"
              :val="item[c.value]"
              :editer="item.empreinte === éditer"
              @edite="e=>valÉditée(item.empreinte, c.value, e.val)"
            />
            <celluleBooléenne
              v-else-if="c.catégorie === 'booléen'"
              :key="c.value"
              :val="item[c.value]"
              :editer="item.empreinte === éditer"
              @edite="e=>valÉditée(item.empreinte, c.value, e.val)"
            />
            <celluleChaîne
              v-else-if="c.catégorie === 'chaîne'"
              :key="c.value"
              :val="item[c.value]"
              :editer="item.empreinte === éditer"
              @edite="e=>valÉditée(item.empreinte, c.value, e.val)"
            />
            <celluleGéoJSON
              v-else-if="c.catégorie === 'géojson'"
              :key="c.value"
              :val="item[c.value]"
              :editer="item.empreinte === éditer"
            />
            <celluleCatégorique
              v-else-if="c.catégorie === 'catégorique'"
              :key="c.value"
              :val="item[c.value]"
              :editer="item.empreinte === éditer"
            />
            <celluleFichier
              v-else-if="c.catégorie === 'fichier'"
              :key="c.value"
              :val="item[c.value]"
              :editer="item.empreinte === éditer"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { traduireNom, couper } from "@/utils";

import titreEntêteTableau from "@/components/tableaux/titreEntêteTableau";
import carteNouvelleColonne from "@/components/tableaux/carteNouvelleColonne";
import boîteNoms from "@/components/commun/boîteNoms/boîte";
import lienOrbite from "@/components/commun/lienOrbite";
import lienTélécharger from "@/components/commun/lienTélécharger";
import celluleBooléenne from "@/components/tableaux/celluleBooléenne";
import celluleNumérique from "@/components/tableaux/celluleNumérique";
import celluleChaîne from "@/components/tableaux/celluleChaîne";
import celluleGéoJSON from "@/components/tableaux/celluleGéoJSON";
import celluleCatégorique from "@/components/tableaux/celluleCatégorique";
import celluleFichier from "@/components/tableaux/celluleFichier";
import celluleDate from "@/components/tableaux/celluleDate";

import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";

export default {
  name: "visTableau",
  components: {
    lienOrbite,
    lienTélécharger,
    boîteNoms,
    carteNouvelleColonne,
    titreEntêteTableau,
    celluleBooléenne,
    celluleNumérique,
    celluleChaîne,
    celluleGéoJSON,
    celluleCatégorique,
    celluleFichier,
    celluleDate
  },
  mixins: [mixinLangues, mixinIPA],
  data: function() {
    return {
      permissionÉcrire: false,
      nomsTableau: {},
      nomsBD: {},
      logo: null,
      nouvelleLigne: false,
      colonnes: null,
      données: null,
      éditer: null,
      valsNouvelleLigne: {}
    };
  },
  computed: {
    nom: function() {
      return Object.keys(this.nomsTableau).length
        ? traduireNom(this.nomsTableau, this.languesPréférées)
        : this.idTableau;
    },
    nomBD: function() {
      return Object.keys(this.nomsBD).length
        ? traduireNom(this.nomsBD, this.languesPréférées)
        : this.idBD;
    },
    idBD: function() {
      return decodeURIComponent(this.$route.params.id);
    },
    idTableau: function() {
      return decodeURIComponent(this.$route.params.idTableau);
    },
    entête: function() {
      const cols = this.colonnes || [];
      const entêtes = cols.map(x => {
        return {
          text: x.variable,
          value: x.id,
          catégorie: x.catégorie
        };
      });
      if (this.permissionÉcrire) {
        entêtes.push({
          text: "Actions",
          value: "actions",
          sortable: false
        });
      }
      return entêtes;
    },
    éléments: function() {
      const données = this.données || [];
      if (this.nouvelleLigne) {
        const premièreLigne = Object.fromEntries(
          this.entête.map(x => [x.value, undefined])
        );
        Object.assign(premièreLigne, { premièreLigne: true, empreinte: -1})
        console.log([premièreLigne, ...données])
        return [premièreLigne, ...données];
      } else {
        console.log(données)
        return données;
      }
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
    creerColonne: async function({ idVariable }) {
      await this.$ipa.tableaux.ajouterColonneTableau(
        this.idTableau,
        idVariable
      );
    },
    actionNouvelleLigne: function() {
      this.nouvelleLigne = !this.nouvelleLigne
      if (this.nouvelleLigne) {
        this.éditer=-1
      }
    },
    éditerÉlément: function(empreinte) {
      if (empreinte === this.éditer) {
        this.éditer = null;
      } else {
        this.éditer = empreinte;
      }
    },
    sauvegarderÉlément: function() {
      console.log(this.valsNouvelleLigne);
      this.$ipa.tableaux.ajouterÉlément(this.idTableau, this.valsNouvelleLigne);
      this.éditer = null;
      this.nouvelleLigne = false;
      this.valsNouvelleLigne = {};
    },
    effacerÉlément: async function(empreinte) {
      console.log(empreinte)
      await this.$ipa.tableaux.effacerÉlément(this.idTableau, empreinte)
    },
    valÉditée: function(empreinteLigne, variable, val) {
      if (empreinteLigne === -1) {
        console.log("valÉditée", {variable,  val})
        this.valsNouvelleLigne[variable] = val
      } else {
        console.error("À faire")
      }
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
          this.colonnes = cols;
        }
      );

      const oublierDonnées = await this.$ipa.tableaux.suivreDonnées(
        this.idTableau,
        données => {
          this.données = données.map(x=>{return {...x.payload.value, empreinte: x.hash}} );
        }
      );

      this.suivre([oublierNoms, oublierNomsBD, oublierColonnes, oublierDonnées]);
    }
  }
};
</script>

<style></style>
