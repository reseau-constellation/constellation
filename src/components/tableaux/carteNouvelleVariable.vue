<template>
  <v-card width="300px">
    <v-card-title>Nouvelle variable</v-card-title>
    <v-divider />
    <v-card-text>
      <v-menu
        offset-x
        :close-on-content-click="false"
        transition="slide-y-transition"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            flat
            dense
            outlined
            v-on="on"
            v-bind="attrs"
            :readonly="true"
            :value="nom"
            label="Nom de la variable"
          />
        </template>
        <boîteNoms
          :noms="noms"
          titre="Nom de la variable"
          sousTitre="Le plus de langues, le mieux !"
          @sauvegarder="sauvegarderNom"
          @changerLangue="changerLangueNom"
          @effacer="effacerNom"
        />
      </v-menu>
      <v-menu
        offset-x
        :close-on-content-click="false"
        transition="slide-y-transition"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            flat
            dense
            outlined
            v-on="on"
            v-bind="attrs"
            :readonly="true"
            :value="descr"
            label="Description"
          />
        </template>
        <boîteNoms
          :noms="descriptions"
          titre="Description"
          sousTitre="Le plus de langues, le mieux !"
          @sauvegarder="sauvegarderDescr"
          @changerLangue="changerLangueDescr"
          @effacer="effacerNom"
        />
      </v-menu>
      <v-select
        v-model="typeVariable"
        outlined
        dense
        label="Type"
        :items="[
          { text: 'Numérique', icône: 'mdi-numeric' },
          { text: 'Chaîne', icône: 'mdi-abugida-thai' },
          { text: 'Catégorique', icône: 'mdi-view-list' },
          { text: 'Vrai/faux', icône: 'mdi-order-bool-ascending-variant' },
          { text: 'GEOJSON', icône: 'mdi-map-marker' },
          { text: 'Fichier', icône: 'mdi-file' }
        ]"
      >
        <template v-slot:item="{ on, item }">
          <v-list-item v-on="on">
            <v-list-item-avatar>
              <v-icon>{{ item.icône }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              {{ item.text }}
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-select>
      <v-text-field outlined dense label="Unités"> </v-text-field>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-spacer />
      <v-btn
        text
        tiled
        outlined
        :disabled="!typeVariable"
        color="primary"
        @click="sauvegarder"
      >
        Confirmer
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import boîteNoms from "@/components/commun/boîteNoms/boîte";
import { traduireNom } from "@/utils";

export default {
  name: "carteNouvelleVariable",
  components: { boîteNoms },
  data: function() {
    return {
      noms: {},
      descriptions: {},
      unités: undefined,
      typeVariable: undefined
    };
  },
  computed: {
    langues: function() {
      return [this.$i18n.locale, ...this.$i18n.fallbackLocale];
    },
    nom: function() {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.langues)
        : undefined;
    },
    descr: function() {
      return Object.keys(this.descriptions).length
        ? traduireNom(this.descriptions, this.langues)
        : undefined;
    }
  },
  methods: {
    sauvegarder: async function() {
      const idVariable = await this.$ipa.variables.créerVariable();
      await this.$ipa.variables.ajouterNomsVariable(idVariable, this.noms);
      await this.$ipa.variables.ajouterDescriptionsVariable(
        idVariable,
        this.descriptions
      );
      if (this.unités) {
        await this.$ipa.variables.ajouterUnitésVariable(
          idVariable,
          this.unités
        );
      }
      this.$emit("sauvegarde", { id: idVariable });
    },
    sauvegarderNom: function({ langue, nom }) {
      this.noms = { ...this.noms, [langue]: nom };
    },
    effacerNom: function({ langue }) {
      this.noms = Object.fromEntries(
        Object.keys(this.noms)
          .filter(x => x !== langue)
          .map(x => [x, this.noms[x]])
      );
    },
    changerLangueNom: function({ langueOriginale, langue, nom }) {
      this.effacerNom(langueOriginale);
      this.sauvegarderNom(langue, nom);
    },
    sauvegarderDescr: function({ langue, nom }) {
      this.descriptions = { ...this.descriptions, [langue]: nom };
    },
    effacerDescr: function({ langue }) {
      this.descriptions = Object.fromEntries(
        Object.keys(this.descriptions)
          .filter(x => x !== langue)
          .map(x => [x, this.descriptions[x]])
      );
    },
    changerLangueDescr: function({ langueOriginale, langue, nom }) {
      this.effacerDescr(langueOriginale);
      this.sauvegarderDescr(langue, nom);
    }
  }
};
</script>

<style></style>
