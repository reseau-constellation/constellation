<template>
  <v-list-item v-bind="$attrs" v-on="$listeners">
    <v-list-item-avatar>
      <v-icon>mdi-key</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{ couper(nom, 30) }}
      </v-list-item-title>
      <v-list-item-subtitle>
        <jeton-membre :id="idAuteur"/>
        <v-chip v-if="auteurs.length > 1" class="me-1 mb-1" label outlined @click.stop> + {{ formatterChiffre(auteurs.length - 1) }}</v-chip>
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action-text>
      <dialogue-epingler :id="id" :optionFichiers="false">
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
                  ? "motsclefs.indiceÉpinglé"
                  : "motsclefs.indiceNonÉpinglé"
              )
            }}</span>
          </v-tooltip>
        </template>
      </dialogue-epingler>
      <dialogue-effacer
        v-if="permissionÉcrire"
        :titre="$t('motsclefs.effacer.titre')"
        :explication="$t('motsclefs.effacer.explication')"
        @effacer="effacerMotClef"
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
            <span>{{ $t("motsclefs.effacer.indiceEffacer") }}</span>
          </v-tooltip>
        </template>
      </dialogue-effacer>
    </v-list-item-action-text>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { couper, traduireNom } from "@/utils";
import lienOrbite from "@/components/commun/lienOrbite.vue";
import dialogueEffacer from "@/components/commun/dialogueEffacer.vue";
import dialogueEpingler from "@/components/commun/dialogueÉpingler.vue";
import jetonMembre from "@/components/commun/jetonMembre.vue";

import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

import { favoris, utils } from "@constl/ipa";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemListeMotsClefs",
  props: ["id"],
  mixins: [mixinIPA, mixinLangues],
  components: { lienOrbite, dialogueEffacer, dialogueEpingler, jetonMembre },
  data: function () {
    return {
      noms: {} as { [key: string]: string },
      épinglé: undefined as undefined | favoris.épingleDispositif,
      permissionÉcrire: false,
      auteurs: [] as utils.infoAuteur[],
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id.slice(9);
    },
    idAuteur: function (): string | undefined {
      return this.auteurs.filter(a=>a.accepté)[0]?.idBdCompte
    }
  },
  methods: {
    couper,
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

      const oublierAuteurs = await this.$ipa.réseau!.suivreAuteursMotClef({
        idMotClef: this.id,
        f: (auteurs) => {
          this.auteurs = auteurs
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
