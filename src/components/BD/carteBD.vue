<template>
  <v-card
    class="mx-4 my-5 px-3 py-5 justify-start text-start"
    min-height="200px"
    max-width="300px"
    @click="$emit('click')"
  >
    <v-img
      :src="logo || require('@/assets/undraw/undraw_Projections_re_1mrh.svg')"
      height="100px"
      contain
    ></v-img>

    <v-card-title
      >{{ couper(nom, 20) }}
      <v-spacer />
      <lien-orbite :lien="idBD" />
    </v-card-title>
    <v-divider />
    <v-card-subtitle>{{ détails }}</v-card-subtitle>
    <v-card-text>
      <v-chip outlined label small class="me-1 my-1" @click.stop>
        <v-progress-circular
          :rotate="score ? 270 : undefined"
          :value="score && score.total ? score.total : 0"
          :indeterminate="!score"
          :color="score ? couleurScore(score.total).couleur : ''"
          :size="15"
          :width="3"
        />
        <span class="ms-2">
          Qualité :
          <span
            :style="`color:${couleurScore(score ? score.total : null).couleur}`"
            class="font-weight-bold"
          >
            {{ score ? couleurScore(score.total).note : "?" }}
          </span>
        </span>
      </v-chip>
      <v-chip
        outlined
        label
        small
        class="me-1 my-1"
        @click.stop="
          licenceApprouvée ? ouvrirLien($t(`licences.${licence}.lien`)) : ''
        "
      >
        <v-icon left small :color="licenceApprouvée ? 'secondary' : 'error'">
          {{ licence ? "mdi-scale-balance" : "mdi-alert-outline" }}
        </v-icon>
        {{
          licence && !licenceApprouvée
            ? licence
            : $t(`licences.${licence || "introuvable"}.nom`)
        }}
        <v-icon v-if="licenceApprouvée" right small>
          mdi-open-in-new
        </v-icon>
      </v-chip>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-show="épinglée !== null"
            icon
            v-bind="attrs"
            v-on="on"
            @click.stop="épinglée ? désépingler() : épingler()"
          >
            <v-icon>{{ épinglée ? "mdi-pin" : "mdi-pin-outline" }}</v-icon>
          </v-btn>
        </template>
        <span>{{épinglée ? "Enlever de mes favoris" : "Épingler dans mes favoris"}}</span>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>

<script>
import { traduireNom, couper, ouvrirLien, couleurScore } from "@/utils";
import lienOrbite from "@/components/commun/lienOrbite";
import mixinIPA from "@/mixins/ipa";
import { licences } from "@/ipa/licences";

export default {
  name: "carteBD",
  props: ["bd"],
  components: { lienOrbite },
  mixins: [mixinIPA],
  data: function() {
    return {
      épinglée: null,
      licence: null,
      logo: null,
      score: null,
      nomsBD: {},
      détailsBD: {},
      variables: []
    };
  },
  computed: {
    idBD: function() {
      return decodeURIComponent(this.bd);
    },
    langues: function() {
      return [this.$i18n.locale, ...this.$i18n.fallbackLocale];
    },
    nom: function() {
      return Object.keys(this.nomsBD).length
        ? traduireNom(this.nomsBD, this.langues)
        : this.idBD;
    },
    détails: function() {
      return traduireNom(this.détailsBD, this.langues);
    },
    licenceApprouvée: function() {
      return this.licence && licences.includes(this.licence);
    }
  },
  methods: {
    couper,
    ouvrirLien,
    couleurScore,
    épingler: async function() {
      await this.$ipa.favoris.épinglerFavori(this.bd)
    },
    désépingler: async function() {
      await this.$ipa.favoris.désépinglerFavori(this.bd)
    },
    initialiserSuivi: async function() {
      const oublierLicence = await this.$ipa.bds.suivreLicence(
        this.idBD,
        licence => {
          this.licence = licence;
        }
      );
      const oublierNoms = await this.$ipa.bds.suivreNomsBD(this.idBD, noms => {
        this.nomsBD = noms;
      });
      const oublierDétails = await this.$ipa.bds.suivreDescrBD(
        this.idBD,
        détails => {
          this.détailsBD = détails;
        }
      );
      const oublierScore = await this.$ipa.bds.suivreScoreBD(
        this.idBD,
        score => (this.score = score)
      );
      const oublierFavori = await this.$ipa.favoris.suivreÉtatFavori(
        this.idBD,
        épinglée => (this.épinglée = épinglée)
      )
      this.suivre([oublierLicence, oublierNoms, oublierDétails, oublierScore]);
    }
  }
};
</script>

<style></style>
