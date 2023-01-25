<template>
  <v-list-item
    v-bind="$attrs" v-on="$தகவல்கள்"
    @click="$emit('click')"
  >
  <div class="text-left">
    <v-list-item>
     <v-list-item-avatar>
      <v-img :src="logo || require('@/assets/undraw/undraw_Projections_re_1mrh.svg')"
       height="25px"
       contain></v-img>
      </v-list-item-avatar>
        <v-list-item-content>
         <v-list-item-title>
          <texteTronqué :texte="nom" :longueurMax="30" />
          </v-list-item-title>
          <v-list-item-subtitle>
           {{ détails }}
         </v-list-item-subtitle>
       </v-list-item-content>
     </v-list-item>
   </div>
<v-spacer />

<v-list-item-action-text>
  <v-radio-group v-model="catégorie" row>
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
          <v-spacer />
          <v-list-item-avatar>
             <lien-orbite :lien="idBd" />
           </v-list-item-avatar>
        </template>
      </dialogue-licence>
      </v-radio-group>
    </v-list-item-action-text>

      <v-list-item-action-text>
       <dialogue-epingler :id="idBd" :optionFichiers="false">
        <template v-slot:activator="{ on, attrs }">
          <v-tooltip v-bind="attrs" v-on="on" open-delay="200" bottom>
            <template v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }">
              <span v-bind="tooltipAttrs" v-on="tooltipOn">
                <v-btn v-bind="attrs" v-on="on" icon>
                  <v-icon>{{
                    épinglé && épinglé.bd ? "mdi-pin" : "mdi-pin-outline"
                  }}</v-icon>
                </v-btn>
              </span>
            </template>
            <span>{{
              $t(
                épinglé && épinglé.bd
                  ? "carteBD.indiceÉpinglé"
                  : "carteBD.indiceNonÉpinglé"
              )
            }}</span>
          </v-tooltip>
        </template>
      </dialogue-epingler>
      </v-list-item-action-text>
    <v-list-item-action-text>
        <v-dialog
        v-if="permissionÉcrire"
        v-model="dialogueEffacerBd"
        width="500"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-tooltip open-delay="200" bottom>
            <template
              v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }"
            >
              <span v-bind="tooltipAttrs" v-on="tooltipOn">
                <v-btn v-bind="attrs" v-on="on" icon color="error">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </span>
            </template>
            <span>{{ $t("bd.vis.indiceEffacer") }}</span>
          </v-tooltip>
        </template>
       <v-card>
          <v-card-title class="headline red--text">
            {{ $t("bd.visBD.நீக்கம்") }}
          </v-card-title>
          <v-card-text>
            {{ $t("bd.visBD.தரவுத்தளம்_அகற்றல்") }}
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              text
              outlined
              @click="dialogueEffacerBd = false"
            >
              {{ $t("bd.visBD.இல்லை") }}
            </v-btn>
            <v-btn color="error" depressed @click="effacerBd">
              {{ $t("bd.visBD.நீக்கவும்") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-list-item-action-text>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { bds, favoris } from "@constl/ipa";

import { traduireNom, couleurScore } from "@/utils";

import lienOrbite from "@/components/commun/lienOrbite.vue";
import dialogueEffacer from "@/components/commun/dialogueEffacer.vue";
import texteTronqué from "@/components/commun/texteTronqué.vue";
import dialogueLicence from "@/components/commun/licences/dialogueLicence.vue";
import dialogueQualité from "@/components/commun/dialogueQualité.vue";
import dialogueEpingler from "@/components/commun/dialogueÉpingler.vue";
import mixinIPA from "@/mixins/ipa";
import mixinLicences from "@/mixins/licences";

export default mixins(mixinIPA, mixinLicences).extend({
  name: "carteBD",
  props: {
    bd: String,
  },
  components: {
    lienOrbite,
    dialogueEffacer,
    texteTronqué,
    dialogueLicence,
    dialogueQualité,
    dialogueEpingler,
  },
  mixins: [mixinIPA, mixinLicences],
  data: function () {
    return {
      noms: {} as { [key: string]: string },
      dialogueEffacerBd: false,

      épinglée: undefined as undefined | favoris.épingleDispositif,
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
    idAuteur: function (): string | undefined {
      return this.auteurs.filter((a) => a.accepté)[0]?.idBdCompte;
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
    couleurScore,
    changerLicence({ licence }: { licence: string }) {
      this.$ipa.bds!.changerLicenceBd({ idBd: this.idBd, licence });
    },
    effacerBd: async function (): Promise<void> {
      await this.$ipa.bds!.effacerBd({ id: this.idBd });
      this.$router.push("/bd");
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
              new Blob([logo.buffer], { type: "image" })
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

      const oublierÉpinglé =
        await this.$ipa.favoris!.suivreEstÉpingléSurDispositif({
          idObjet: this.idBd,
          f: (épinglée) => {
            this.épinglée = épinglée;
          },
        });

      this.suivre([
        oublierPermissionÉcrire,
        oublierImage,
        oublierLicence,
        oublierNoms,
        oublierDétails,
        oublierScore,
        oublierÉpinglé,
      ]);
    },
  },
});
</script>

<style></style>
