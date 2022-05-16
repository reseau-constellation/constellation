<template>
  <v-list-item @click="$emit('click')">
    <v-list-item-content>
      {{ couper(nom, 25) }}
      <div>
        <jeton-variable v-for="m in variables" :key="m" :id="m" />
      </div>
    </v-list-item-content>
    <v-list-item-action>
      <v-dialog v-if="permissionÉcrire" v-model="dialogue" width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" icon color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="headline red--text">
            {{ $t("itemTableau.அட்டவணை_நீக்கம்") }}
          </v-card-title>

          <v-card-text>
            {{ $t("itemTableau.தகவல்") }}
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text outlined @click="dialogue = false">
              {{ $t("itemTableau.Non") }}
            </v-btn>
            <v-btn color="error" depressed @click="effacerTableau">
              {{ $t("itemTableau.effacer") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { traduireNom, couper } from "@/utils";

import jetonVariable from "@/components/commun/jetonVariable.vue";

import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemTableau",
  props: {
    id: String,
    idBd: String,
  },
  components: { jetonVariable },
  mixins: [mixinLangues, mixinIPA],
  data: function () {
    return {
      permissionÉcrire: false,
      dialogue: false,
      nomsTableau: {} as { [key: string]: string },
      variables: [] as string[],
    };
  },
  computed: {
    langues: function (): string[] {
      return [this.$i18n.locale, ...(this.$i18n.fallbackLocale as string)];
    },
    idTableau: function (): string {
      return decodeURIComponent(this.id);
    },
    nom: function (): string {
      return Object.keys(this.nomsTableau).length
        ? traduireNom(this.nomsTableau, this.langues)
        : this.idTableau;
    },
  },
  methods: {
    couper,
    effacerTableau: async function () {
      await this.$ipa.bds!.effacerTableauBd({
        id: this.idBd,
        idTableau: this.idTableau,
      });
    },
    initialiserSuivi: async function () {
      const oublierPermissionÉcrire = await this.$ipa.suivrePermissionÉcrire({
        id: this.idBd,
        f: (permission) => (this.permissionÉcrire = permission),
      });

      const oublierNoms = await this.$ipa.tableaux!.suivreNomsTableau({
        idTableau: this.idTableau,
        f: (noms) => {
          this.nomsTableau = noms;
        },
      });
      const oublierVariables = await this.$ipa.tableaux!.suivreVariables({
        idTableau: this.idTableau,
        f: (variables) => {
          this.variables = variables;
        },
      });
      this.suivre([oublierPermissionÉcrire, oublierNoms, oublierVariables]);
    },
  },
});
</script>

<style></style>
