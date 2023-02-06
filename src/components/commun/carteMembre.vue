<template>
  <v-dialog v-model="dialogue" scrollable max-width="700">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
        <v-btn v-bind="attrs" v-on="on"
            height="75"
            width="1100"
            text
            >
           <div class="text-left">
            <texteTronqué :texte="nom" :longueurMax="30" />
           </div>
          <v-spacer />
           <lien-orbite :lien="id" />
        </v-btn>
      </template>

     <v-card  class="text-h5 grey lighten-2">
       <v-card-title>
        {{ $t("carteMembre.முகவரி") }}
        <v-spacer />
        <v-btn icon @click="dialogue = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
       </v-card-title>
       <v-card-actions>
        <v-card-text class="text-left">
          <v-radio-group
            v-model="dialogue"
            column
            scrollable
          >
         <span v-if="courriel">
          <p class="mb-0 text-overline">
            {{ $t("carteMembre.தொடர்பு") }}
          </p>
           <v-chip label outlined small>
            <v-icon left small>mdi-email</v-icon>
            <texteTronqué :texte="courriel" :longueurMax="50" />
          </v-chip>
         </span>
         <p class="mb-0 text-overline">
          {{ $t("carteMembre.தரவு") }}
         </p>
          <jeton-bd v-for="bd in bds.slice(0, N_MAX_LISTE)" :key="bd" :id="bd" />
           <v-list
            v-if="bds.length > N_MAX_LISTE"
            class="me-1 mb-1"
            >
            {{
            $t("carteMembre.bdsExtra", {
              n: formatterChiffre(bds.length - N_MAX_LISTE),
            })
           }}
         </v-list>
         <v-list-item v-if="!bds.length" label outlined small disabled>
          {{ $t("carteMembre.aucuneBd") }}
         </v-list-item>

         <p class="mb-0 text-overline">
          {{ $t("carteMembre.திட்டங்கள்") }}
         </p>
         <jeton-bd v-for="projet in projets" :key="projet" :id="projet" />
          <v-chip v-if="!projets.length" label outlined small disabled>
          {{ $t("carteMembre.Aucunprojet") }}
          </v-chip>
          </v-radio-group>
        </v-card-text>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { traduireNom } from "@/utils";

import texteTronqué from "@/components/commun/texteTronqué.vue";
import dialogueEffacer from "@/components/commun/dialogueEffacer.vue";
import lienOrbite from "@/components/commun/lienOrbite.vue";
import jetonBd from "@/components/commun/jetonBd.vue";
import avatarProfil from "@/components/commun/avatarProfil.vue";

import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default mixins(mixinIPA, mixinLangues).extend({
  name: "carteMembre",
  props: ["id", "vuIlyA"],
  mixins: [mixinLangues, mixinIPA],
  components: { lienOrbite, jetonBd, avatarProfil, texteTronqué },
  data: function () {
    return {
      noms: {} as { [key: string]: string },
      dialogue: false,
      courriel: undefined as undefined | string | null,
      bds: [] as string[],
      projets: [] as string[],
      monIdBdRacine: undefined as undefined | string,

      N_MAX_LISTE: 4,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : (this.$t("traduction.மறைமுகம்") as string);
    },
    moiMême: function (): boolean {
      return this.id === this.monIdBdRacine;
    },
    actif: function (): boolean {
      return Boolean(
        Object.keys(this.noms).length ||
          this.courriel ||
          this.bds.length ||
          this.projets.length
      );
    },
  },
  methods: {
      initialiserSuivi: async function () {
      const oublierIdBdRacine = await this.$ipa.suivreIdBdCompte({
        f: (id) => (this.monIdBdRacine = id),
      });

      const oublierNoms = await this.$ipa.réseau!.suivreNomsMembre({
        idCompte: this.id,
        f: (noms) => {
          this.noms = noms;
        },
      });
      const oublierCourriel = await this.$ipa.réseau!.suivreCourrielMembre({
        idCompte: this.id,
        f: (courriel) => {
          this.courriel = courriel;
        },
      });
      const oublierBds = await this.$ipa.réseau!.suivreBdsMembre({
        idCompte: this.id,
        f: (bds) => {
          this.bds = bds || [];
        },
      });
      const oublierProjets = await this.$ipa.réseau!.suivreProjetsMembre({
        idCompte: this.id,
        f: (projets) => {
          this.projets = projets || [];
        },
      });
      this.suivre([
        oublierIdBdRacine,
        oublierNoms,
        oublierCourriel,
        oublierBds,
        oublierProjets,
      ]);
    },
  },
});
</script>

<style></style>
