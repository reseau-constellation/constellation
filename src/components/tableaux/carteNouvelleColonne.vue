<template>
  <v-card width="300px">
    <v-card-title>Ajoutez une colonne</v-card-title>
    <v-divider />
    <v-card-text>
      <v-select
        outlined
        dense
        label="Variable"
        v-model="idVariable"
        :disabled="!variablesDisponible.length"
        :items="variablesDisponible"
      >
        <template v-slot:item="{ on, item }">
          <item-liste-variables v-on="on" :id="item" />
        </template>
        <template v-slot:selection="{ item }">
          <item-liste-variables :id="item" />
        </template>
      </v-select>

      <v-menu :close-on-content-click="false" transition="slide-y-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-on="on" v-bind="attrs" outlined tiled text color="primary">
            <v-icon left>mdi-plus</v-icon>
            Nouvelle variable
          </v-btn>
        </template>
        <carte-nouvelle-variable @sauvegarde="e => (idVariable = e.id)" />
      </v-menu>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-spacer />
      <v-btn
        text
        outlined
        color="primary"
        :disabled="!idVariable"
        @click="creerColonne"
      >
        Confirmer
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import carteNouvelleVariable from "@/components/tableaux/carteNouvelleVariable";
import itemListeVariables from "@/components/tableaux/itemListeVariables";
import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";

export default {
  name: "carteNouvelleColonne",
  components: { carteNouvelleVariable, itemListeVariables },
  mixins: [mixinIPA, mixinLangues],
  data: function() {
    return {
      idVariable: null,
      variablesDisponible: []
    };
  },
  methods: {
    creerColonne: async function() {
      this.$emit("creerColonne", { idVariable: this.idVariable });
    },
    initialiserSuivi: async function() {
      const oublierVariables = await this.$ipa.variables.suivreVariables(
        variables => {
          this.variablesDisponible = variables;
        }
      );

      this.suivre([oublierVariables]);
    }
  }
};
</script>

<style></style>
