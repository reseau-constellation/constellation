<template>
    <v-list>
      <v-slide-x-transition group class="d-flex flex-wrap justify-center text-start">
        <nouvelle-variable :key="0">
          <template v-slot:activator="{ on, attrs }">
            <v-list-item
              :key="0" v-bind="attrs"
              v-on="on"
            >
              <v-list-item-avatar>
                <v-icon>mdi-plus</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title> {{ $t("dialogueNouvelleVariable.மாறி") }} </v-list-item-title>
                <v-list-item-subtitle>{{ $t("dialogueNouvelleVariable.sousTitre")}}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </nouvelle-variable>

        <item-liste-variables v-for="id in idsVariables" :key="id" :id="id"/>

      </v-slide-x-transition>
      <v-skeleton-loader v-if="idsVariables===undefined" type="list-item-avatar-two-line@2"/>
    </v-list>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import Titre from "@/components/commun/Titre.vue";
import nouvelleVariable from "@/components/variables/dialogueNouvelleVariable.vue";
import itemListeVariables from "@/components/variables/itemListeVariables.vue";
import mixinIPA from "@/mixins/ipa";

export default mixins(mixinIPA).extend({
  name: "BD",
  components: { Titre, nouvelleVariable, itemListeVariables },
  mixins: [mixinIPA],
  data: function () {
    return {
      idsVariables: undefined as undefined | string[],
    };
  },
  methods: {
    initialiserSuivi: async function () {
      const oublierListeVariables = await this.$ipa.variables!.suivreVariables({
        f: (variables) => {
          this.idsVariables = variables;
        },
      });
      this.suivre(oublierListeVariables);
    },
  },
});
</script>

<style></style>
