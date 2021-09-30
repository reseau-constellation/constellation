<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline">
        Connecter dispositifs
        <v-spacer />
        <v-btn icon @click="fermer">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />

      <v-card-text>
        <v-window v-model="étape">
          <v-window-item :value="1">
            <p class="mt-2">
              Vous pouvez connecter différents navigateurs, téléphones ou
              installations locales de Constellation.
            </p>
            <v-list>
              <v-list-item
                v-for="op in options"
                :key="op.titre"
                @click="étape = op.prochaineÉtape"
              >
                <v-list-item-avatar>
                  <v-icon>{{ op.icône }}</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ op.titre }}
                  </v-list-item-title>
                  <span class="text--secondary">
                    {{ op.sousTitre }}
                  </span>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon>{{
                    $vuetify.rtl ? "mdi-chevron-left" : "mdi-chevron-right"
                  }}</v-icon>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-window-item>
          <v-window-item :value="2">
            <v-list-item>
              <v-list-item-avatar class="ma-0">
                <v-avatar
                  color="primary"
                  class="subheading white--text ma-0"
                  size="25"
                  v-text="formatterChiffre(1)"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                Sur l'autre dispositif, choisir "Rejoindre un compte existant"
                et copier ci-dessous le code affiché.
              </v-list-item-content>
            </v-list-item>
            <v-autocomplete
              v-model="idOrbiteNouveau"
              class="mx-3"
              :items="
                idsOrbite.filter((d) => !dispositifsDeCeCompte.includes(d))
              "
              outlined
              dense
              clearable
            />
            <v-list-item>
              <v-list-item-avatar class="ma-0">
                <v-avatar
                  color="primary"
                  class="subheading white--text ma-0"
                  size="25"
                  v-text="formatterChiffre(2)"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                Copier le code de confirmation suivant sur l'autre dispositif.
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              outlined
              class="py-2 ma-2"
              dense
              @click="copier(idBdRacine)"
            >
              <v-list-item-avatar
                ><v-icon>mdi-content-copy</v-icon></v-list-item-avatar
              >
              <v-list-item-content>{{
                couper(idBdRacine || "", 30)
              }}</v-list-item-content>
            </v-list-item>
          </v-window-item>
          <v-window-item :value="3">
            <v-list-item>
              <v-list-item-avatar class="ma-0">
                <v-avatar
                  color="primary"
                  class="subheading white--text ma-0"
                  size="25"
                  v-text="formatterChiffre(1)"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                Cliquez sur le code ci-dessous et copiez-le sur l'autre
                dispositif.
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              outlined
              class="py-2 ma-2"
              dense
              @click="copier(idDispositif)"
            >
              <v-list-item-avatar
                ><v-icon>mdi-content-copy</v-icon></v-list-item-avatar
              >
              <v-list-item-content>{{
                couper(idDispositif || "", 30)
              }}</v-list-item-content>
            </v-list-item>
            <v-list-item class="text-left">
              <v-list-item-avatar class="ma-0">
                <v-avatar
                  color="primary"
                  class="subheading white--text ma-0"
                  size="25"
                  v-text="formatterChiffre(2)"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                Entrez le code de confirmation de l'autre disposiitif
                ci-dessous.
              </v-list-item-content>
            </v-list-item>
            <v-text-field
              v-model="idBdRacineNouveau"
              outlined
              dense
              :rules="règlesValide.adresseBdRacine"
            />
          </v-window-item>
          <v-window-item :value="4" class="text-center">
            <span v-if="idOrbiteNouveau">
              <p class="text-h5 mt-5">
                Vous allez ajouter le dispositif avec l'identifiant suivant à
                votre compte.
              </p>
              <p class="text--secondary text-left">
                <v-icon>mdi-alert-circle-outline</v-icon>
                Vérifiez bien le code ci-dessous. Il n'est présentement pas
                possible de révoquer l'accès à un dispositif.
              </p>
              <p>{{ idOrbiteNouveau }}</p>
            </span>
            <span v-else-if="idBdRacineNouveau">
              <p class="text-h5 mt-5">
                Vous allez joindre ce dispositif au compte suivant.
              </p>
              <v-list-item class="text-left">
                <v-list-item-avatar>
                  <avatar-profil :id="idBdRacineNouveau" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ couper(nomNouveauCompte || idBdRacineNouveau, 25) }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <lien-orbite :lien="idBdRacineNouveau" />
                </v-list-item-action>
              </v-list-item>
              <v-divider />
              <p class="mt-4 text--secondary text-left">
                <v-icon>mdi-alert-circle-outline</v-icon>
                Note: cette action suprimera les données associées au compte
                présent. Assurez-vous bien d'avoir des copies (hors
                Constellation) de toute base de données que vous voudriez
                transférer au nouveau compte.
              </p>
            </span>
            <v-btn
              text
              outlined
              :loading="cestParti"
              color="primary"
              @click="confirmer"
              >Confirmer</v-btn
            >
          </v-window-item>
        </v-window>
      </v-card-text>

      <span v-show="étape !== 1">
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn text outlined @click="() => retourAuDébut()">
            <v-icon left>{{
              $vuetify.rtl ? "mdi-chevron-right" : "mdi-chevron-left"
            }}</v-icon>
            Retour
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="!toutEstPrêt"
            color="primary"
            text
            outlined
            @click="auSuivant"
          >
            Suivant
            <v-icon right>{{
              $vuetify.rtl ? "mdi-chevron-left" : "mdi-chevron-right"
            }}</v-icon>
          </v-btn>
        </v-card-actions>
      </span>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

import { copier, couper, traduireNom } from "@/utils";

import avatarProfil from "@/components/commun/avatarProfil.vue";
import lienOrbite from "@/components/commun/lienOrbite.vue";

import {
  adresseOrbiteValide,
  schémaFonctionOublier,
} from "@constl/ipa/lib/client";
import { infoDispositifEnLigne } from "@constl/ipa/lib/reseau";

export default mixins(mixinIPA, mixinLangues).extend({
  name: "dialogueAjouterDispositif",
  mixins: [mixinIPA, mixinLangues],
  components: { avatarProfil, lienOrbite },
  data: function () {
    return {
      dialogue: false,
      étape: 1,

      idOrbiteNouveau: undefined as undefined | string,
      idBdRacineNouveau: undefined as undefined | string,
      idBdRacine: undefined as undefined | string,
      idDispositif: undefined as undefined | string,

      cestParti: false,
      nomsNouveauCompte: {},
      oublierNoms: undefined as undefined | schémaFonctionOublier,
      dispositifsDeCeCompte: [] as string[],
      dispositifs: [] as infoDispositifEnLigne[],
      règlesValide: {
        adresseBdRacine: [
          (val: string) =>
            adresseOrbiteValide(val || "") ||
            "Le code doit être une adresse Orbite valide.",
          (val: string) =>
            (val || "").slice(-7) === "/racine" ||
            "L'adresse Orbite doit terminer en `/racine`.",
        ],
      },
      options: [
        {
          titre: "Nouveau dispositif",
          sousTitre: "Ajouter un dispositif à ce compte",
          icône: "mdi-plus",
          prochaineÉtape: 2,
        },
        {
          titre: "Rejoindre un compte existant",
          sousTitre: "Ajouter ce dispositif à un compte existant",
          icône: "mdi-plus",
          prochaineÉtape: 3,
        },
      ],
    };
  },
  computed: {
    idsOrbite: function (): string[] {
      return this.dispositifs.map((d) => d.info.idOrbite);
    },
    nomNouveauCompte: function (): string | null {
      return Object.keys(this.nomsNouveauCompte).length
        ? traduireNom(this.nomsNouveauCompte, this.languesPréférées)
        : null;
    },
    toutEstPrêt: function (): boolean {
      if (this.étape === 2) {
        return Boolean(this.idOrbiteNouveau);
      } else if (this.étape === 3) {
        return Boolean(
          this.idBdRacineNouveau &&
            this.règlesValide.adresseBdRacine.every(
              (r) => r(this.idBdRacineNouveau!) === true
            )
        );
      }
      return false;
    },
  },
  watch: {
    idBdRacineNouveau: async function (val) {
      if (
        val &&
        this.règlesValide.adresseBdRacine.every((r) => r(val) === true)
      ) {
        const oublierNoms = await this.$ipa.réseau!.suivreNomsMembre(
          val,
          (noms) => {
            this.nomsNouveauCompte = noms;
          }
        );
        if (this.oublierNoms) this.oublierNoms();
        this.oublierNoms = oublierNoms;
        this.suivre([oublierNoms]);
      }
    },
  },
  methods: {
    copier,
    couper,
    retourAuDébut: function () {
      this.étape = 1;
      this.idOrbiteNouveau = undefined;
      this.idBdRacineNouveau = undefined;
    },
    auSuivant: function () {
      this.étape = 4;
    },
    confirmer: async function () {
      if (!this.idBdRacineNouveau) return;
      this.cestParti = true;
      if (this.idOrbiteNouveau) {
        await this.$ipa.ajouterDispositif(this.idOrbiteNouveau);
      } else {
        localStorage.setItem("idBdRacine", this.idBdRacineNouveau);
        await this.$ipa.rejoindreCompte(this.idBdRacineNouveau);
      }
      this.cestParti = false;
      this.fermer();
    },
    fermer: function () {
      this.retourAuDébut();
      this.dialogue = false;
    },
    initialiserSuivi: async function () {
      this.idDispositif = await this.$ipa.obtIdOrbite();

      const oublierIdBdRacine = await this.$ipa.suivreIdBdRacine(
        (id) => (this.idBdRacine = id)
      );

      const oublierDispositifsEnLigne =
        await this.$ipa.réseau!.suivreDispositifsEnLigne((dispositifs) => {
          this.dispositifs = dispositifs;
        });

      const oublierDispositifsDeCeCompte = await this.$ipa.suivreDispositifs(
        (dispositifs) => {
          this.dispositifsDeCeCompte = dispositifs;
        }
      );
      this.suivre([
        oublierIdBdRacine,
        oublierDispositifsEnLigne,
        oublierDispositifsDeCeCompte,
      ]);
    },
  },
  destroyed: function () {
    if (this.oublierNoms) this.oublierNoms();
  },
});
</script>

<style></style>
