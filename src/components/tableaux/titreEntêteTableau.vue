<template>
  <dialogue-info-colonne
    :permissionModifier="permissionModifier"
    :idColonne="idColonne"
    :idVariable="idVariable"
    :idTableau="idTableau"
  >
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <v-icon v-show="index" left small>mdi-crown-outline</v-icon>
        <texteTronqué :texte="titre" :longueurMax="20" />
      </span>
    </template>
  </dialogue-info-colonne>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import dialogueInfoColonne from "@/components/tableaux/dialogueInfoColonne.vue";
import texteTronqué from "@/components/commun/texteTronqué.vue";

import { traduireNom } from "@/utils";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default mixins(mixinIPA, mixinLangues).extend({
  name: "titreEntêteTableau",
  props: {
    idVariable: String,
    idColonne: String,
    idTableau: String,
    index: Boolean,
    permissionModifier: Boolean,
  },
  mixins: [mixinLangues, mixinIPA],
  components: { dialogueInfoColonne, texteTronqué },
  data: function () {
    return {
      noms: {},
    };
  },
  computed: {
    titre: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.idColonne;
    },
  },
  methods: {
    initialiserSuivi: async function () {
      const oublierNoms = await this.$ipa.variables!.suivreNomsVariable({
        id: this.idVariable,
        f: (noms) => {
          this.noms = noms;
        },
      });
      this.suivre([oublierNoms]);
    },
  },
});
</script>

<style></style>
