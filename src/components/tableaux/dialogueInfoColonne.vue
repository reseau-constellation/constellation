<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>
    <v-card>
      <v-card-title>
        {{ couper(nom, 20) }}
        <v-spacer />
      </v-card-title>
      <v-card-subtitle>
        {{ description ? description : $t("bd.visBD.விளக்கம்") }}
      </v-card-subtitle>
      <v-divider />
      <v-card-text>
        <p class="mb-0 text-overline">
          {{ $t("dialogueInfoColonne.variable") }}
        </p>
        <jeton-variable :id="idVariable" />
        <v-checkbox
          v-model="index"
          :label="$t('dialogueInfoColonne.index')"
          :append-icon="index ? 'mdi-crown-outline' : ''"
          :disable="!permissionModifier"
          @change="changerColonneIndex"
        />
        <p class="text-overline mb-0">
          {{ $t("dialogueNouvelleVariable.règles") }}
        </p>
        <v-list>
          <itemListeRègle
            v-for="r in règles"
            :key="r.règle.id"
            :regle="r.règle"
            :nomVariable="nom"
          >
          </itemListeRègle>
        </v-list>
      </v-card-text>
      <v-divider />

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="dialogue = false">
          {{ $t("communs.fermer") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { valid, variables } from "@constl/ipa";

import { couper, traduireNom } from "@/utils";
import lienOrbite from "@/components/commun/lienOrbite.vue";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";
import boîteNoms from "@/components/commun/boîteNoms/boîte.vue";
import itemListeRègle from "@/components/règles/itemListeRègles.vue";
import jetonVariable from "@/components/commun/jetonVariable.vue";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "dialogueInfoColonne",
  props: {
    idColonne: String,
    idVariable: String,
    idTableau: String,
    permissionModifier: Boolean,
  },
  mixins: [mixinLangues, mixinIPA],
  components: { lienOrbite, boîteNoms, jetonVariable, itemListeRègle },
  data: function () {
    return {
      dialogue: false,

      nomsVariable: {} as { [key: string]: string },
      descriptions: {} as { [key: string]: string },
      index: false as boolean,
      règles: [] as valid.règleColonne[],
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.nomsVariable).length
        ? traduireNom(this.nomsVariable, this.languesPréférées)
        : this.idVariable;
    },
    description: function (): string {
      return Object.keys(this.descriptions).length
        ? traduireNom(this.descriptions, this.languesPréférées)
        : "";
    },
  },
  methods: {
    couper,
    changerColonneIndex: async function () {
      console.log("changerColIndex", this.index)
      await this.$ipa.tableaux!.changerColIndex({
        idTableau: this.idTableau,
        idColonne: this.idColonne,
        val: this.index,
      });
    },
    initialiserSuivi: async function () {
      const oublierNoms = await this.$ipa.variables!.suivreNomsVariable({
        id: this.idVariable,
        f: (noms) => {
          this.nomsVariable = noms;
        },
      });

      const oublierDescriptions =
        await this.$ipa.variables!.suivreDescrVariable({
          id: this.idVariable,
          f: (descrs) => {
            this.descriptions = descrs;
          },
        });

      const oublierIndex = await this.$ipa.tableaux!.suivreIndex({
        idTableau: this.idTableau,
        f: (colonnesIndex) => (this.index = colonnesIndex.includes(this.idColonne)),
      });

      const oublierRègles = await this.$ipa.tableaux!.suivreRègles({
        idTableau: this.idTableau,
        f: (règles) => this.règles = règles.filter(r=>r.colonne === this.idColonne)
      })

      this.suivre([oublierNoms, oublierDescriptions, oublierIndex]);
    },
  },
});
</script>

<style></style>
