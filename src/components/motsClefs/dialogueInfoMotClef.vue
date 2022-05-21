<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>
    <v-card>
      <v-card-title>
        {{ couper(nom, 20) }}
        <span v-if="permissionÉcrire">
          <boîteNoms
            :noms="noms"
            titre="bd.vis.boîteDescr.titre"
            etiquetteAucunNom="variables.boîteNoms.aucunNom"
            @sauvegarder="sauvegarderNom"
            @changerLangue="changerLangueNom"
            @effacer="effacerNom"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-on="on" v-bind="attrs">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </boîteNoms>
        </span>
        <v-spacer />
        <lien-orbite :lien="id" />
      </v-card-title>

      <v-divider />
      <v-card-text>

      </v-card-text>
      <v-divider />

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="dialogue=false">
          {{ $t("communs.fermer") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import {
  couper,
  traduireNom,
} from "@/utils";
import lienOrbite from "@/components/commun/lienOrbite.vue";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";
import boîteNoms from "@/components/commun/boîteNoms/boîte.vue";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "dialogueInfoMotClef",
  props: ["id"],
  mixins: [mixinLangues, mixinIPA],
  components: { lienOrbite, boîteNoms },
  data: function () {
    return {
      dialogue: false,

      noms: {} as { [key: string]: string },
      permissionÉcrire: false,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id;
    },
  },
  methods: {
    couper,
    sauvegarderNom: async function ({
      langue,
      nom,
    }: {
      langue: string;
      nom: string;
    }) {
      await this.$ipa.motsClefs!.ajouterNomsMotClef({
        id: this.id,
        noms: {
          [langue]: nom,
        },
      });
    },
    effacerNom: async function ({ langue }: { langue: string }) {
      await this.$ipa.motsClefs!.effacerNomMotClef({ id: this.id, langue });
    },
    changerLangueNom: async function ({
      langueOriginale,
      langue,
      nom,
    }: {
      langueOriginale: string;
      langue: string;
      nom: string;
    }) {
      await this.$ipa.motsClefs!.effacerNomMotClef({
        id: this.id,
        langue: langueOriginale,
      });
      await this.$ipa.motsClefs!.ajouterNomsMotClef({
        id: this.id,
        noms: {
          [langue]: nom,
        },
      });
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

      this.suivre([
        oublierPermissionÉcrire,
        oublierNoms,
      ]);
    },
  },
});
</script>

<style></style>
