<template>
  <v-snackbar
    v-model="active"
    :timeout="-1"
    :multi-line="true"
    color="error"
    outlined
  >
    <p>
      <span class="font-weight-bold"
        >Oups ! Nous avons une erreur avec Constellation.</span
      >
      <br />
      C'est peut-être grave, peut-être pas. Je n'en sais rien. En tout cas, nous
      sommes désolés. Mais c'est ce qui se passe, parfois, quand on utilise un
      logiciel de fine pointe.
      <br />
      Si tout paraît fonctionner, vous pouvez continuer à travailler sans souci.
      Mais si quelque chose cloche, merci de nous signaler l'erreur afin que
      nous puissions la régler !
    </p>

    <div class="text-center">
      <v-btn tiled outlined color="error" @click="signaler"
        >Signaler l'erreur</v-btn
      >
    </div>

    <p class="font-weight-bold" @click="détails = !détails">
      {{ détails ? "Cacher les détails" : "Plus de détails" }}
      <v-icon color="error">{{
        détails ? "mdi-chevron-up" : "mdi-chevron-down"
      }}</v-icon>
    </p>

    <v-list
      v-if="détails && nouvelleErreur"
      style="max-height: 300px"
      class="overflow-y-auto"
    >
      <item-erreur-constellation :erreur="nouvelleErreur" :sousGroupe="false" />
      <v-divider />
      <v-list-group
        v-show="autresErreurs.length"
        color="error"
        :value="voirToutes"
        prepend-icon="mdi-alert-outline"
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title>Erreurs précédentes</v-list-item-title>
          </v-list-item-content>
        </template>
        <item-erreur-constellation
          v-for="(err, i) in autresErreurs"
          :key="i"
          :erreur="err"
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

      nouvelleErreur: undefined as Error | undefined,
      toutesLesErreurs: [] as Error[],

      fOublierErreurs: undefined as undefined | (() => void),
    };
  },

  computed: {
    autresErreurs: function (): Error[] {
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

      const titre = "Erreur signalée de l'application Constellation";
      const erreur = this.nouvelleErreur.toString();
      const tracéErreur = this.nouvelleErreur.stack;
      //const autresErreurs = this.autresErreurs.length ? "\n*Erreurs précédentes* :\n" + this.autresErreurs.map(e=>`\n${e.toString()}\n\`\`\`${e.stack}\`\`\``).join("\n") : ""
      const contenu = `**Erreur signalée de l'application Constellation**\n\n*Inclure des détails [facultatif]*\n[P. ex., Quand l'erreur est-elle survenue ? Que faisiez-vous ?]\n\n**Informations incluses automatiquement - ne pas modifier à mois que vous soyez vraiment sûr de ce que vous faites**\n*Version de l'apli*\n- [${
        isElectron() ? "X" : " "
      }] Électron\n- [${
        isElectron() ? " " : "X"
      }] Apli Internet\n\n*Tracé de l'erreur*\n${erreur}\n\`\`\`${tracéErreur}\`\`\`\n`;
      const urlSignalement = `${URL_BASE_SIGNALER_AUTO}?title=${encodeURI(
        titre
      )}&body=${encodeURI(contenu)}`;
      ouvrirLien(urlSignalement);
    },
  },

  mounted: async function () {
    const fSuivreErreurs = (erreurs: { nouvelle: Error; toutes: Error[] }) => {
      console.log({ erreurs });
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
