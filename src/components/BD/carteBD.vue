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
      <lien-orbite :lien="idBd" />
    </v-card-title>
    <v-divider />
    <v-card-subtitle>{{ détails }}</v-card-subtitle>
    <v-card-text>
      <dialogueQualité :score="score" :permissionModifier="permissionÉcrire">
        <template v-slot:activator="{ on, attrs }">
          <v-chip
            outlined
            label
            small
            class="me-1 my-1"
            v-bind="attrs"
            v-on="on"
          >
            <v-progress-circular
              :rotate="score ? 270 : undefined"
              :value="score && score.total ? score.total * 100 : 0"
              :indeterminate="!score"
              :color="
                score ? couleurScore(score.total).couleur : 'grey lighten-2'
              "
              :size="15"
              :width="3"
            />
            <span class="ms-2">
              Qualité :
              <span
                :style="`color:${
                  couleurScore(score ? score.total : null).couleur
                }`"
                class="font-weight-bold"
                >{{
                  score
                    ? $t("carteBD.note." + couleurScore(score.total).note)
                    : $t("communs.pointInterrogation")
                }}
              </span>
            </span>
          </v-chip>
        </template>
      </dialogueQualité>

      <dialogue-licence
        :idLicence="licence"
        :permissionModifier="permissionÉcrire"
        @changerLicence="changerLicence"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-chip
            v-bind="attrs"
            v-on="on"
            outlined
            label
            small
            class="me-1 my-1"
          >
            <v-icon
              left
              small
              :color="licenceApprouvée ? 'secondary' : 'error'"
            >
              {{ licence ? "mdi-scale-balance" : "mdi-alert-outline" }}
            </v-icon>
            {{
              licence && !licenceApprouvée
                ? licence
                : $t(`licences.info.${licence || "introuvable"}.abr`)
            }}
          </v-chip>
        </template>
      </dialogue-licence>
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
        <span>
          {{ épinglée ? $t("carteBD.அகற்று") : $t("carteBD.பொருத்து") }}</span
        >
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { bds, favoris } from "@constl/ipa";

import { traduireNom, couper, couleurScore } from "@/utils";

import lienOrbite from "@/components/commun/lienOrbite.vue";
import dialogueLicence from "@/components/commun/licences/dialogueLicence.vue";
import dialogueQualité from "@/components/commun/dialogueQualité.vue";
import mixinIPA from "@/mixins/ipa";
import mixinLicences from "@/mixins/licences";

export default mixins(mixinIPA, mixinLicences).extend({
  name: "carteBD",
  props: ["bd"],
  components: { lienOrbite, dialogueLicence, dialogueQualité },
  mixins: [mixinIPA, mixinLicences],
  data: function () {
    return {
      épinglée: null as undefined | null | favoris.ÉlémentFavoris,
      licence: null as null | string,
      logo: null as null | string,
      score: null as null | bds.infoScore,
      permissionÉcrire: false,
      nomsBD: {} as { [key: string]: string },
      détailsBD: {} as { [key: string]: string },
      variables: [] as string[],
    };
  },
  computed: {
    idBd: function (): string {
      return decodeURIComponent(this.bd);
    },
    langues: function (): string[] {
      return [this.$i18n.locale, ...(this.$i18n.fallbackLocale as string)];
    },
    nom: function (): string {
      return Object.keys(this.nomsBD).length
        ? traduireNom(this.nomsBD, this.langues)
        : this.idBd;
    },
    détails: function (): string {
      return traduireNom(this.détailsBD, this.langues);
    },
  },
  methods: {
    couper,
    couleurScore,
    épingler: async function () {
      await this.$ipa.favoris!.épinglerFavori({
        id: this.idBd,
        dispositifs: "TOUS",
      });
    },
    désépingler: async function () {
      await this.$ipa.favoris!.désépinglerFavori({ id: this.idBd });
    },
    changerLicence({ licence }: { licence: string }) {
      this.$ipa.bds!.changerLicenceBd({ idBd: this.idBd, licence });
    },
    initialiserSuivi: async function () {
      const oublierPermissionÉcrire = await this.$ipa.suivrePermissionÉcrire({
        id: this.idBd,
        f: (permission) => (this.permissionÉcrire = permission),
      });

      const oublierImage = await this.$ipa.bds!.suivreImage({
        idBd: this.idBd,
        f: (logo) => {
          if (logo) {
            const url = URL.createObjectURL(
              new Blob([logo.buffer], { type: "image/png" })
            );
            this.logo = url;
          } else {
            this.logo = null;
          }
        },
      });

      const oublierLicence = await this.$ipa.bds!.suivreLicence({
        id: this.idBd,
        f: (licence) => {
          this.licence = licence;
        },
      });
      const oublierNoms = await this.$ipa.bds!.suivreNomsBd({
        id: this.idBd,
        f: (noms) => {
          this.nomsBD = noms;
        },
      });
      const oublierDétails = await this.$ipa.bds!.suivreDescrBd({
        id: this.idBd,
        f: (détails) => {
          this.détailsBD = détails;
        },
      });
      const oublierScore = await this.$ipa.bds!.suivreScoreBd({
        id: this.idBd,
        f: (score) => (this.score = score),
      });
      const oublierFavori = await this.$ipa.favoris!.suivreÉtatFavori({
        id: this.idBd,
        f: (épinglée) => (this.épinglée = épinglée),
      });
      this.suivre([
        oublierPermissionÉcrire,
        oublierImage,
        oublierLicence,
        oublierNoms,
        oublierDétails,
        oublierScore,
        oublierFavori,
      ]);
    },
  },
});
</script>

<style></style>
