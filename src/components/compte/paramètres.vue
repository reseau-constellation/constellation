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
              <boîteNoms :noms="noms" />
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
              v-model="image"
              accept="image/*"
              prepend-icon="mdi-camera-outline"
              append-icon="mdi-close"
              :clearable="false"
              outlined
              small-chips
              dense
              :label="$t('compte.onglets.compte.image')"
              @click:append="effacerImage"
            ></v-file-input>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <p class="px-0 text-overline">
          {{ $t("compte.onglets.compte.dispositifs") }}
        </p>
        <p class="text--disabled">
          Pour l'instant, l'ajout d'un nouveau dispositif électronique à votre
          compte n'est pas encore pris en charge. Mais on y travaille !
        </p>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import mixinIPA from "@/mixins/ipa";
import boîteNoms from "@/components/commun/boîteNoms/boîte";
import { traduireNom } from "@/utils";

export default {
  name: "ongletParamètresCompte",
  data: function() {
    return {
      image: undefined,
      courrielOrig: "",
      courriel: "",
      noms: {}
    };
  },
  mixins: [mixinIPA],
  components: { boîteNoms },
  computed: {
    nom: function() {
      const languesPréférées = [this.$i18n.locale];
      return traduireNom(this.noms, languesPréférées);
    }
  },
  watch: {
    image: function(fichier) {
      if (fichier) {
        this.$ipa.compte.sauvegarderImage(fichier);
      } else {
        this.effacerImage();
      }
    },
    courrielOrig: function(courriel) {
      this.courriel = courriel;
    }
  },
  methods: {
    sauvegarderCourriel: function() {
      const courriel = this.courriel.trim();
      if (courriel && courriel !== this.courrielOrig) {
        this.$ipa.compte.sauvegarderCourriel(courriel);
      }
    },
    initialiserSuivi: async function() {
      const oublierCourriel = await this.$ipa.compte.suivreCourriel(
        courriel => {
          if (courriel) this.courrielOrig = courriel;
        }
      );
      const oublierNoms = await this.$ipa.compte.suivreNoms(noms => {
        this.noms = noms;
      });
      this.suivre([oublierCourriel, oublierNoms]);
    },
    effacerImage: async function() {
      await this.$ipa.compte.effacerImage();
    }
  }
};
</script>

<style></style>
