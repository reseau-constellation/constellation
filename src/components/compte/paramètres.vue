<template>
  <v-card class="pa-5">
    <p class="px-0 mb-0 text-overline">
      {{ $t("compte.onglets.compte.info") }}
    </p>
    <v-divider />
    <p class="py-0 text--disabled">
      <v-icon small disabled>mdi-information-outline</v-icon>
      {{ $t("compte.onglets.compte.infoPublique") }}
    </p>
    <div class="d-flex flex-wrap">
      <v-card flat width="300" class="mx-3 my-3">
        <v-menu
          offset-x
          :close-on-content-click="false"
          :disabled="noms === null"
          transition="slide-y-transition"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              flat
              dense
              hide-details
              prepend-icon="mdi-account"
              v-on="on"
              v-bind="attrs"
              :readonly="true"
              :loading="noms === null"
              :disabled="noms === null"
              :value="
                noms ? (nom ? nom : $t('compte.onglets.compte.aucunNom')) : ''
              "
              :label="$t('compte.onglets.compte.nom')"
            />
          </template>
          <boîteNoms
            :noms="noms || {}"
            titre="compte.onglets.compte.titreBoîteNoms"
            sousTitre="compte.onglets.compte.sousTitreBoîteNoms"
            @sauvegarder="sauvegarderNom"
            @changerLangue="changerLangueNom"
            @effacer="effacerNom"
          />
        </v-menu>
      </v-card>

      <v-card flat width="300" class="mx-3 my-3">
        <v-text-field
          v-model="courriel"
          outlined
          dense
          hide-details
          prepend-icon="mdi-email"
          :loading="courrielOrig === undefined"
          :disabled="courrielOrig === undefined"
          :label="$t('compte.onglets.compte.courriel')"
          @blur="sauvegarderCourriel"
        />
      </v-card>

      <v-card flat width="300" class="mx-3 my-3">
        <v-file-input
          v-model="imageProfil"
          accept="image/*"
          prepend-icon="mdi-camera-outline"
          append-icon="mdi-close"
          :clearable="false"
          outlined
          small-chips
          dense
          :label="$t('compte.onglets.compte.image')"
          :error="$t('compte.onglets.compte.fichierTropGrand')"
          :error-messages="
            fichierTropGrand ? $t('compte.onglets.compte.பட_அளவு') : []
          "
          @click:append="effacerImage"
        ></v-file-input>
      </v-card>

      <v-card flat width="300" class="mb-3"> </v-card>
    </div>
    <p class="px-0 my-0 text-overline">
      {{ $t("compte.onglets.compte.dispositifs") }}
    </p>

    <v-divider v-if="dispositifs && dispositifs.length" />
    <v-skeleton-loader v-if="dispositifs === null" type="paragraph" />
    <v-list v-else two-line dense>
      <dialogue-ajouter-dispositif>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item v-bind="attrs" v-on="on">
            <v-list-item-avatar>
              <v-icon>mdi-plus</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t("compte.onglets.compte.சேர்த்தல்") }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ $t("compte.onglets.compte.பாதுகாப்பு") }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>
      </dialogue-ajouter-dispositif>
      <v-list-item v-for="d in dispositifs" :key="d">
        <v-list-item-avatar>
          <v-img :src="image('dispositif')" contain />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t("compte.onglets.compte.Id") }} {{ d }}
          </v-list-item-title>
          <v-list-item-subtitle class="success--text">
            {{
              d === idDispositif ? $t("compte.onglets.compte.Dispositif") : ""
            }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { profil } from "@constl/ipa";

import mixinIPA from "@/mixins/ipa";
import mixinImages from "@/mixins/images";

import boîteNoms from "@/components/commun/boîteNoms/boîte.vue";
import dialogueAjouterDispositif from "@/components/compte/dialogueAjouterDispositif.vue";

import { traduireNom } from "@/utils";

const { MAX_TAILLE_IMAGE } = profil;

export default mixins(mixinIPA, mixinImages).extend({
  name: "ongletParamètresCompte",
  data: function () {
    return {
      imageProfil: undefined as undefined | string,
      courrielOrig: undefined as undefined | null | string,
      courriel: "",

      noms: null as null | { [key: string]: string },
      fichierTropGrand: false,
      dispositifs: null as null | string[],
      idDispositif: undefined as undefined | string,
    };
  },
  mixins: [mixinIPA, mixinImages],
  components: { boîteNoms, dialogueAjouterDispositif },
  computed: {
    nom: function (): string {
      const languesPréférées = [this.$i18n.locale];
      return traduireNom(this.noms || {}, languesPréférées);
    },
  },
  watch: {
    imageProfil: async function (fichier) {
      if (fichier) {
        if (fichier.size > MAX_TAILLE_IMAGE) {
          this.fichierTropGrand = true;
        } else {
          this.fichierTropGrand = false;
          await this.$ipa.profil!.sauvegarderImage(fichier);
        }
      } else {
        this.effacerImage();
      }
    },
    courrielOrig: function (courriel) {
      this.courriel = courriel;
    },
  },
  methods: {
    sauvegarderCourriel: async function () {
      const courriel = this.courriel.trim();
      if (courriel !== this.courrielOrig) {
        if (courriel.length) {
          await this.$ipa.profil!.sauvegarderCourriel(courriel);
        } else {
          await this.$ipa.profil!.effacerCourriel();
        }
      }
    },
    initialiserSuivi: async function () {
      this.idDispositif = await this.$ipa.obtIdOrbite();

      const oublierCourriel = await this.$ipa.profil!.suivreCourriel(
        (courriel) => {
          this.courrielOrig = courriel;
        }
      );

      const oublierNoms = await this.$ipa.profil!.suivreNoms((noms) => {
        this.noms = noms;
      });

      const oublierDispositifs = await this.$ipa.suivreDispositifs(
        (dispositifs) => {
          this.dispositifs = dispositifs.sort((a) =>
            a === this.idDispositif ? -1 : 1
          );
        }
      );

      this.suivre([oublierCourriel, oublierNoms, oublierDispositifs]);
    },
    effacerImage: async function () {
      if (this.fichierTropGrand) {
        this.imageProfil = undefined;
        this.fichierTropGrand = false;
      } else {
        await this.$ipa.profil!.effacerImage();
      }
    },
    sauvegarderNom({ langue, nom }: { langue: string; nom: string }) {
      this.$ipa.profil!.sauvegarderNom(langue, nom);
    },
    changerLangueNom({
      langueOriginale,
      langue,
      nom,
    }: {
      langueOriginale: string;
      langue: string;
      nom: string;
    }) {
      this.$ipa.profil!.effacerNom(langueOriginale);
      this.$ipa.profil!.sauvegarderNom(langue, nom);
    },
    effacerNom({ langue }: { langue: string }) {
      this.$ipa.profil!.effacerNom(langue);
    },
    ajouterDispositif() {
      console.warn("À faire");
    },
  },
});
</script>

<style></style>
