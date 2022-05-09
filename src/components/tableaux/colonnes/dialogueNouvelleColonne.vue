<template>
  <v-dialog v-model="dialogue" scrollable max-width="500">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline">
        {{ $t("dialogueNouvelleColonne.நெடுவரிசை") }}
      </v-card-title>
      <v-divider />

      <v-card-text class="mt-3">
        <p class="text-overline mb-2">
          {{ $t("dialogueNouvelleColonne.மாறி") }}
        </p>
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
          <template v-slot:item="{ item, on, attrs }">
            <item-variable v-bind="attrs" v-on="on" :id="item" />
          </template>
          <template v-slot:selection="{ item }">
            <jeton-variable :id="item" :longueur="25" />
          </template>
        </v-select>

        <p class="text-overline mb-0">
          {{ $t("dialogueNouvelleColonne.சோதனைகள்") }}
        </p>
        <v-list>
          <v-list-item v-for="r in règlesVariable" :key="r"> </v-list-item>
        </v-list>

        <p class="text-overline mb-0">
          {{ $t("dialogueNouvelleColonne.கட்டுப்பாடுகள்") }}
        </p>
        <v-list>
          <v-list-item v-for="r in règlesPropre" :key="r"> </v-list-item>
        </v-list>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="annuler">
          {{ $t("communs.annuler") }}
        </v-btn>
        <v-btn color="primary" :disabled="!prêt" depressed @click="sauvegarder">
          {{ $t("communs.sauvegarder") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { utils, valid } from "@constl/ipa";

import dialogueNouvelleVariable from "@/components/commun/dialogueNouvelleVariable.vue";
import itemVariable from "@/components/tableaux/colonnes/itemVariable.vue";
import jetonVariable from "@/components/commun/jetonVariable.vue";

import mixinIPA from "@/mixins/ipa";

export default mixins(mixinIPA).extend({
  name: "dialogueNouvelleColonne",
  components: { dialogueNouvelleVariable, itemVariable, jetonVariable },
  mixins: [mixinIPA],
  data: function () {
    return {
      dialogue: false,

      variable: undefined as string | undefined,
      variablesDisponibles: [] as string[],
      règlesVariable: [] as valid.règleVariable[],
      règlesPropre: [] as valid.règleVariable[],
      oublierRèglesVariable: undefined as
        | utils.schémaFonctionOublier
        | undefined,
    };
  },
  watch: {
    variable: async function (val: string) {
      if (this.oublierRèglesVariable) this.oublierRèglesVariable();
      if (val) {
        this.oublierRèglesVariable =
          await this.$ipa.variables.suivreRèglesVariable(
            val,
            (règles: valid.règleVariable[]) => {
              this.règlesVariable = règles;
            }
          );
      }
    },
  },
  computed: {
    prêt: function (): boolean {
      return Boolean(this.variable);
    },
  },
  methods: {
    sauvegarder: async function () {
      this.$emit("sauvegarder", {
        idVariable: this.variable,
        règles: this.règlesPropre,
      });

      this.fermer();
    },
    nouvelleVariable: function ({ id }: { id: string }) {
      this.variable = id;
    },
    fermer: function () {
      this.variable = undefined;
      this.dialogue = false;
    },
    initialiserSuivi: async function () {
      const oublierVariables = await this.$ipa.variables.suivreVariables(
        (variables: string[]) => {
          this.variablesDisponibles = variables;
        }
      );

      this.suivre([oublierVariables]);
    },
  },
  destroyed: function () {
    if (this.oublierRèglesVariable) this.oublierRèglesVariable();
  },
});
</script>

<style></style>
