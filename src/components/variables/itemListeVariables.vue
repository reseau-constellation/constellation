<template>
  <v-list-item v-bind="$attrs" v-on="$listeners">
    <v-list-item-avatar>
      <v-icon>{{ icôneCatégorie }}</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>{{ nom }}</v-list-item-title>
      <v-list-item-subtitle>{{ descr }}</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <span>
        <dialogue-epingler :id="id" :optionFichiers="false">
          <template v-slot:activator="{ on, attrs }">
            <v-tooltip v-bind="attrs" v-on="on" open-delay="200" bottom>
              <template
                v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }"
              >
                <span v-bind="tooltipAttrs" v-on="tooltipOn">
                  <v-btn v-bind="attrs" v-on="on" icon>
                    <v-icon>{{
                      épinglé && épinglé.bd ? "mdi-pin" : "mdi-pin-outline"
                    }}</v-icon>
                  </v-btn>
                </span>
              </template>
              <span>{{
                $t(
                  épinglé && épinglé.bd
                    ? "variables.indiceÉpinglé"
                    : "variables.indiceNonÉpinglé"
                )
              }}</span>
            </v-tooltip>
          </template>
        </dialogue-epingler>
        <dialogue-effacer
          v-if="permissionÉcrire"
          :titre="$t('variables.effacer.titre')"
          :explication="$t('variables.effacer.explication')"
          @effacer="effacerVariable"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-tooltip v-bind="attrs" v-on="on" open-delay="200" bottom>
              <template
                v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }"
              >
                <span v-bind="tooltipAttrs" v-on="tooltipOn">
                  <v-btn v-bind="attrs" v-on="on" icon color="error">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </span>
              </template>
              <span>{{ $t("variables.indiceEffacer") }}</span>
            </v-tooltip>
          </template>
        </dialogue-effacer>
      </span>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";
import { traduireNom, couper, icôneCatégorieVariable } from "@/utils";
import dialogueEffacer from "@/components/commun/dialogueEffacer.vue";
import dialogueEpingler from "@/components/commun/dialogueÉpingler.vue";

import { favoris } from "@constl/ipa";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemListeVariables",
  props: ["id"],
  mixins: [mixinIPA, mixinLangues],
  components: { dialogueEpingler, dialogueEffacer },
  data: function () {
    return {
      noms: {} as { [key: string]: string },
      descriptions: {} as { [key: string]: string },
      permissionÉcrire: false,
      épinglé: undefined as undefined | favoris.épingleDispositif,
      catégorie: undefined as undefined | string,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : couper(this.id, 30);
    },
    descr: function (): string {
      return Object.keys(this.descriptions).length
        ? traduireNom(this.descriptions, this.languesPréférées)
        : "";
    },
    icôneCatégorie: function (): string {
      return this.catégorie
        ? icôneCatégorieVariable(this.catégorie)
        : "mdi-xml";
    },
  },
  methods: {
    couper,
    effacerVariable: async function () {
      await this.$ipa.variables!.effacerVariable({ id: this.id });
    },
    initialiserSuivi: async function () {
      const oublierPermissionÉcrire = await this.$ipa.suivrePermissionÉcrire({
        id: this.id,
        f: (permission) => (this.permissionÉcrire = permission),
      });

      const oublierNoms = await this.$ipa.variables!.suivreNomsVariable({
        id: this.id,
        f: (noms) => {
          this.noms = noms;
        },
      });

      const oublierDescriptions =
        await this.$ipa.variables!.suivreDescrVariable({
          id: this.id,
          f: (descriptions) => {
            this.descriptions = descriptions;
          },
        });

      const oublierÉpinglé =
        await this.$ipa.favoris!.suivreEstÉpingléSurDispositif({
          idObjet: this.id,
          f: (épinglé) => {
            this.épinglé = épinglé;
          },
        });

      const oublierCatégorie =
        await this.$ipa.variables!.suivreCatégorieVariable({
          id: this.id,
          f: (catégorie) => {
            this.catégorie = catégorie;
          },
        });

      this.suivre([
        oublierPermissionÉcrire,
        oublierNoms,
        oublierDescriptions,
        oublierÉpinglé,
        oublierCatégorie,
      ]);
    },
  },
});
</script>

<style></style>
