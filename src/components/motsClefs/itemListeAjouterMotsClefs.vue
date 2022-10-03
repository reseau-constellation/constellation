<template>
  <v-list-item v-bind="$attrs" v-on="$listeners" @click="$emit('selectionne')">
    <v-list-item-avatar>
      <v-icon>mdi-key</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      <texteTronqué :texte="nom" :longueurMax="30" />
    </v-list-item-content>
    <v-list-item-action-text v-if="permissionÉcrire"> </v-list-item-action-text>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { traduireNom } from "@/utils";
import lienOrbite from "@/components/commun/lienOrbite.vue";
import dialogueEffacer from "@/components/commun/dialogueEffacer.vue";
import dialogueEpingler from "@/components/commun/dialogueÉpingler.vue";
import texteTronqué from "@/components/commun/texteTronqué.vue";

import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

import { favoris } from "@constl/ipa";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemListeAjouterMotsClefs",
  props: ["id"],
  mixins: [mixinIPA, mixinLangues],
  components: { lienOrbite, dialogueEffacer, dialogueEpingler, texteTronqué },
  data: function () {
    return {
      noms: {} as { [key: string]: string },
      épinglé: undefined as undefined | favoris.épingleDispositif,
      permissionÉcrire: false,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id.slice(9);
    },
  },
  methods: {
    sauvegarderNom({ langue, nom }: { langue: string; nom: string }) {
      this.$ipa.motsClefs!.sauvegarderNomMotClef({ id: this.id, langue, nom });
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
      this.$ipa.motsClefs!.effacerNomMotClef({
        id: this.id,
        langue: langueOriginale,
      });
      this.$ipa.motsClefs!.sauvegarderNomMotClef({ id: this.id, langue, nom });
    },
    effacerNom({ langue }: { langue: string }) {
      this.$ipa.motsClefs!.effacerNomMotClef({ id: this.id, langue });
    },
    effacerMotClef() {
      this.$ipa.motsClefs!.effacerMotClef({ id: this.id });
    },
    initialiserSuivi: async function () {
      const oublierPermissionÉcrire = await this.$ipa.suivrePermissionÉcrire({
        id: this.id,
        f: (permission) => (this.permissionÉcrire = permission),
      });

      const oublierNoms = await this.$ipa.motsClefs!.suivreNomsMotClef({
        id: this.id,
        f: (noms) => {
          this.noms = noms;
        },
      });

      const oublierÉpinglé =
        await this.$ipa.favoris!.suivreEstÉpingléSurDispositif({
          idObjet: this.id,
          f: (épinglé) => {
            this.épinglé = épinglé;
          },
        });

      this.suivre([oublierPermissionÉcrire, oublierNoms, oublierÉpinglé]);
    },
  },
});
</script>

<style></style>
