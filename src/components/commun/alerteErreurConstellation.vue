<template>
  <v-snackbar
    v-model="active"
    :timeout="-1"
    :multi-line="true"
    color="error"
    outlined
  >
    <p>
      <span class="font-weight-bold">
        {{ $t("alerteErreurConstellation.பிழை_உள்ளது") }}
      </span>
      <br />
      {{ $t("alerteErreurConstellation.விளக்கம்") }}
      <br />
      {{ $t("alerteErreurConstellation.புகாரளிக்க") }}
    </p>

    <div class="text-center">
      <v-btn tiled outlined color="error" @click="signaler">
        {{ $t("alerteErreurConstellation.புகாரளிக்கவும்") }}
      </v-btn>
    </div>

    <p class="font-weight-bold" @click="détails = !détails">
      {{
        détails
          ? $t("alerteErreurConstellation.மறை")
          : $t("alerteErreurConstellation.தகவல்கள்")
      }}
      <v-icon color="error">{{
        détails ? "mdi-chevron-up" : "mdi-chevron-down"
      }}</v-icon>
    </p>

    <v-list
      v-if="détails && nouvelleErreur"
      style="max-height: 300px"
      class="overflow-y-auto"
    >
      <item-erreur-constellation
        :erreur="nouvelleErreur.erreur"
        :sousGroupe="false"
      />
      <v-divider />
      <v-list-group
        v-show="autresErreurs.length"
        color="error"
        :value="voirToutes"
        prepend-icon="mdi-alert-outline"
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title>
              {{ $t("alerteErreurConstellation.பிழை") }}
            </v-list-item-title>
          </v-list-item-content>
        </template>
        <item-erreur-constellation
          v-for="(err, i) in autresErreurs"
          :key="i"
          :erreur="err.erreur"
          sousGroupe
        />
      </v-list-group>
    </v-list>

    <template v-slot:action="{ attrs }">
      <v-btn color="red" text v-bind="attrs" @click="active = false">
        <v-icon left>mdi-close</v-icon>
        {{ $t("communs.fermer") }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import itemErreurConstellation from "@/components/commun/itemErreurConstellation.vue";

import isElectron from "is-electron";

import { ouvrirLien } from "@/utils";
import { URL_BASE_SIGNALER_AUTO } from "@/utils/config";

export default mixins().extend({
  name: "alerteErreurConstellation",
  components: { itemErreurConstellation },
  data: function () {
    return {
      active: false,
      détails: false,
      voirToutes: false,

      nouvelleErreur: undefined as { erreur: string; id?: string } | undefined,
      toutesLesErreurs: [] as { erreur: string; id?: string }[],

      fOublierErreurs: undefined as undefined | (() => void),
    };
  },

  computed: {
    autresErreurs: function (): { erreur: string; id?: string }[] {
      if (this.toutesLesErreurs.length <= 1) return [];
      return this.toutesLesErreurs.slice(1, this.toutesLesErreurs.length);
    },
  },

  methods: {
    montrerDétails: function () {
      this.détails = true;
    },
    signaler: function () {
      if (!this.nouvelleErreur) return;

      const titre = this.$t("alerteErreurConstellation.பிழை") as string;
      const erreur = this.nouvelleErreur.erreur.toString();
      const tracéErreur = ""; // this.nouvelleErreur.erreur.stack;
      //const autresErreurs = this.autresErreurs.length ? "\n*Erreurs précédentes* :\n" + this.autresErreurs.map(e=>`\n${e.toString()}\n\`\`\`${e.stack}\`\`\``).join("\n") : ""
      const contenu = this.$t("alerteErreurConstellation.பிழை_இருக்கிறது", {
        அ: isElectron() ? "X" : " ",
        ஆ: isElectron() ? " " : "X",
        இ: erreur,
        ஈ: tracéErreur,
      }) as string;
      const urlSignalement = `${URL_BASE_SIGNALER_AUTO}?title=${encodeURI(
        titre
      )}&body=${encodeURI(contenu)}`;
      ouvrirLien(urlSignalement);
    },
  },

  mounted: async function () {
    const fSuivreErreurs = (erreurs: {
      nouvelle: { erreur: string; id?: string };
      toutes: { erreur: string; id?: string }[];
    }) => {
      this.active = true;

      const { nouvelle, toutes } = erreurs;
      this.nouvelleErreur = nouvelle;
      this.toutesLesErreurs = toutes;
    };

    this.$ipa.événements.on("erreur", fSuivreErreurs);

    if (this.$ipa.erreurs.length) {
      fSuivreErreurs({
        nouvelle: this.$ipa.erreurs[0],
        toutes: this.$ipa.erreurs,
      });
    }

    this.fOublierErreurs = () =>
      this.$ipa.événements.off("erreur", fSuivreErreurs);
  },
  destroyed: function () {
    if (this.fOublierErreurs) this.fOublierErreurs();
  },
});
</script>

<style></style>
