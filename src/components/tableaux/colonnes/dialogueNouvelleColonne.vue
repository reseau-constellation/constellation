<template>
  <v-dialog v-model="dialogue" scrollable max-width="500">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline"> Nouvelle colonne </v-card-title>
      <v-divider />

      <v-card-text class="mt-3">
        <p class="text-overline mb-2">Variable</p>
        <v-select
          v-model="variable"
          :items="variablesDisponibles"
          outlined
          dense
        >
          <template v-slot:append-outer>
            <dialogue-nouvelle-variable @sauvegarde="nouvelleVariable">
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-on="on" v-bind="attrs" icon small>
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>
            </dialogue-nouvelle-variable>
          </template>
        </v-select>

        <p class="text-overline mb-0">Contrôles de qualité (hérités)</p>
        <v-list>
          <v-list-item v-for="r in règlesVariable" :key="r"> </v-list-item>
        </v-list>

        <p class="text-overline mb-0">Contrôles de qualité (propres)</p>
        <v-list>
          <v-list-item v-for="r in règlesPropre" :key="r"> </v-list-item>
        </v-list>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="dialogue = false">
          {{ $t("communs.annuler") }}
        </v-btn>
        <v-btn color="primary" :disabled="!prêt" depressed @click="sauvegarder">
          {{ $t("communs.sauvegarder") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import dialogueNouvelleVariable from "@/components/commun/dialogueNouvelleVariable";
import mixinIPA from "@/mixins/ipa";

export default {
  name: "dialogueNouvelleColonne",
  components: { dialogueNouvelleVariable },
  mixins: [mixinIPA],
  data: function () {
    return {
      dialogue: false,

      variable: null,
      variablesDisponibles: [],
      règlesVariable: [],
      règlesPropre: [],
      oublierRèglesVariable: null,
    };
  },
  watch: {
    variable: async function (val) {
      if (this.oublierRèglesVariable) this.oublierRèglesVariable();
      if (val) {
        this.oublierRèglesVariable =
          await this.$ipa.variables.suivreRèglesVariable(val, (règles) => {
            this.règlesVariable = règles;
          });
      }
    },
  },
  computed: {
    prêt: function () {
      return this.variable;
    },
  },
  methods: {
    sauvegarder: async function () {
      this.$emit("sauvegarder", {
        idVariable: this.idVariable,
        règles: this.règlesPropre,
      });
      this.dialogue = false;
    },
    nouvelleVariable: function ({ id }) {
      this.variable = id;
    },
    initialiserSuivi: async function () {
      const oublierVariables = await this.$ipa.variables.suivreVariables(
        (variables) => {
          this.variablesDisponibles = variables;
        }
      );

      this.suivre([oublierVariables]);
    },
  },
};
</script>

<style></style>
