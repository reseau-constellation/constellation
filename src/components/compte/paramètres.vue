<template>
  <v-card class="pa-5">
    <v-row>
      <v-col cols="12">
        <p class="px-0 mb-0 text-overline">
          {{ $t("compte.onglets.compte.info") }}
        </p>
        <p class="py-0 text--disabled">
          <v-icon small disabled>mdi-information-outline</v-icon>
          {{ $t("compte.onglets.compte.infoPublique") }}
        </p>
        <v-row>
          <v-col cols="4">
            <v-menu
              offset-x
              :close-on-content-click="false"
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
                  :value="nom ? nom : $t('compte.onglets.compte.aucunNom')"
                  :label="$t('compte.onglets.compte.nom')"
                />
              </template>
              <boîteNoms
                :noms="noms"
                titre="compte.onglets.compte.titreBoîteNoms"
                sousTitre="compte.onglets.compte.sousTitreBoîteNoms"
                @sauvegarder="sauvegarderNom"
                @changerLangue="changerLangueNom"
                @effacer="effacerNom"
              />
            </v-menu>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="courriel"
              outlined
              dense
              hide-details
              prepend-icon="mdi-email"
              :label="$t('compte.onglets.compte.courriel')"
              @blur="sauvegarderCourriel"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
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
              :error="fichierTropGrand"
              :error-messages="
                fichierTropGrand
                  ? [
                      'La taille de l\'image doit être inférieure à 1,5 megaoctets.',
                    ]
                  : []
              "
              @click:append="effacerImage"
            ></v-file-input>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <p class="px-0 my-0 text-overline">
          {{ $t("compte.onglets.compte.dispositifs") }}
        </p>

        <v-divider v-if="dispositifs && dispositifs.length" />
        <v-skeleton-loader v-if="dispositifs === null" type="paragraph" />
        <v-list v-if="dispositifs !== null" two-line dense>
          <v-list-item @click="ajouterDispositif">
            <v-list-item-avatar>
              <v-icon>mdi-plus</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title> Ajouter un dispositif </v-list-item-title>
              <v-list-item-subtitle>
                Ajouttez un autre ordinateur, téléphone, ou navigateur à votre
                compte pour plus de sécurité.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-for="d in dispositifs" :key="d">
            <v-list-item-avatar>
              <v-img :src="image('dispositif')" contain />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title> Id: {{ d }} </v-list-item-title>
              <v-list-item-subtitle class="success--text">
                {{ d === idDispositif ? "Dispositif présent" : "" }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import mixinIPA from "@/mixins/ipa";
import mixinImages from "@/mixins/images";
import boîteNoms from "@/components/commun/boîteNoms/boîte";
import { traduireNom } from "@/utils";

export default {
  name: "ongletParamètresCompte",
  data: function () {
    return {
      imageProfil: undefined,
      courrielOrig: "",
      courriel: "",
      noms: {},
      fichierTropGrand: false,
      dispositifs: null,
    };
  },
  mixins: [mixinIPA, mixinImages],
  components: { boîteNoms },
  computed: {
    nom: function () {
      const languesPréférées = [this.$i18n.locale];
      return traduireNom(this.noms, languesPréférées);
    },
    idDispositif: function () {
      return this.$ipa.orbite.identity.id;
    },
  },
  watch: {
    imageProfil: function (fichier) {
      if (fichier) {
        if (fichier.size > this.$ipa.compte.MAX_TAILLE_IMAGE) {
          this.fichierTropGrand = true;
        } else {
          this.fichierTropGrand = false;
          this.$ipa.compte.sauvegarderImage(fichier);
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
    sauvegarderCourriel: function () {
      const courriel = this.courriel.trim();
      if (courriel !== this.courrielOrig) {
        courriel.length
          ? this.$ipa.compte.sauvegarderCourriel(courriel)
          : this.$ipa.compte.effacerCourriel();
      }
    },
    initialiserSuivi: async function () {
      const oublierCourriel = await this.$ipa.compte.suivreCourriel(
        (courriel) => {
          if (courriel) this.courrielOrig = courriel;
        }
      );

      const oublierNoms = await this.$ipa.compte.suivreNoms((noms) => {
        this.noms = noms;
      });

      const oublierDispositifs = await this.$ipa.suivreDispositifs(
        (dispositifs) => {
          this.dispositifs = dispositifs;
        }
      );
      this.suivre([oublierCourriel, oublierNoms, oublierDispositifs]);
    },
    effacerImage: async function () {
      if (this.fichierTropGrand) {
        this.imageProfil = undefined;
        this.fichierTropGrand = false;
      } else {
        await this.$ipa.compte.effacerImage();
      }
    },
    sauvegarderNom({ langue, nom }) {
      this.$ipa.compte.sauvegarderNom(langue, nom);
    },
    changerLangueNom({ langueOriginale, langue, nom }) {
      this.$ipa.compte.effacerNom(langueOriginale);
      this.$ipa.compte.sauvegarderNom(langue, nom);
    },
    effacerNom({ langue }) {
      this.$ipa.compte.effacerNom(langue);
    },
    ajouterDispositif() {
      console.warn("À faire");
    },
  },
};
</script>

<style></style>
