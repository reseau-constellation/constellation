<template>
  <v-list-item v-bind="$attrs" v-on="$listeners">
    <v-list-item-avatar>
      <v-icon>mdi-pin-outline</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      {{ couper(nom, 30) }}
    </v-list-item-content>
    <v-list-item-action-text>
      <dialogue-epingler :id="epingle.idObjet" :optionFichiers="false">
        <template v-slot:activator="{ on, attrs }">
          <v-tooltip v-bind="attrs" v-on="on" open-delay="200" bottom>
            <template v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }">
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
                  ? "favoris.indiceÉpinglé"
                  : "favoris.indiceNonÉpinglé"
              )
            }}</span>
          </v-tooltip>
        </template>
      </dialogue-epingler>
      <dialogue-effacer
        :titre="$t('favoris.effacer.titre')"
        :explication="$t('favoris.effacer.explication')"
        @effacer="effacerFavoris"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-tooltip v-bind="attrs" v-on="on" open-delay="200" bottom>
            <template v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }">
              <span v-bind="tooltipAttrs" v-on="tooltipOn">
                <v-btn v-bind="attrs" v-on="on" icon color="error">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </span>
            </template>
            <span>{{ $t("favoris.effacer.indiceEffacer") }}</span>
          </v-tooltip>
        </template>
      </dialogue-effacer>
    </v-list-item-action-text>
  </v-list-item>
</template>

<script lang="ts">
import { PropType } from "vue";
import mixins from "vue-typed-mixins";

import { couper, traduireNom } from "@/utils";
import lienOrbite from "@/components/commun/lienOrbite.vue";
import dialogueEpingler from "@/components/commun/dialogueÉpingler.vue";
import dialogueEffacer from "@/components/commun/dialogueEffacer.vue";

import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

import { favoris } from "@constl/ipa";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemListeFavoris",
  props: {
    epingle: Object as PropType<favoris.ÉlémentFavorisAvecObjet>,
  },
  mixins: [mixinIPA, mixinLangues],
  components: { lienOrbite, dialogueEpingler, dialogueEffacer },
  data: function () {
    return {
      noms: {} as { [key: string]: string },
      épinglé: undefined as undefined | favoris.épingleDispositif,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.epingle.idObjet.slice(9);
    },
  },
  methods: {
    couper,
    effacerFavoris: async function () {
      await this.$ipa.favoris!.désépinglerFavori({ id: this.epingle.idObjet });
    },
    initialiserSuivi: async function () {
      const oublierÉpinglé =
        await this.$ipa.favoris!.suivreEstÉpingléSurDispositif({
          idObjet: this.epingle.idObjet,
          f: (épinglé) => {
            this.épinglé = épinglé;
          },
        });

      const oublierNoms = await this.$ipa.motsClefs!.suivreNomsMotClef({
        id: this.epingle.idObjet,
        f: (noms) => {
          this.noms = noms;
        },
      });

      this.suivre([oublierÉpinglé, oublierNoms]);
    },
  },
});
</script>

<style></style>
