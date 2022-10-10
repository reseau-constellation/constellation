<template>
  <v-container>
    <v-card flat>
      <v-card-subtitle>
        <v-breadcrumbs :items="petitPousset" class="pa-0">
          <template v-slot:divider>
            <v-icon>{{
              $vuetify.rtl ? "mdi-chevron-left" : "mdi-chevron-right"
            }}</v-icon>
          </template>
          <template v-slot:item="{ item }">
            <v-breadcrumbs-item
              :disabled="item.disabled"
              @click="$router.push(item.href)"
            >
              <texteTronqué :texte="item.text" :longueurMax="15" />
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
      </v-card-subtitle>
      <imageÉditable
        :srcImage="imageBd"
        :editable="permissionÉcrire"
        :MAX_TAILLE_IMAGE="MAX_TAILLE_IMAGE"
        @imageChoisie="imageBdChoisie"
        @effacerImage="effacerImageBd"
      />
      <v-card-title>
        <texteTronqué :texte="nom" :longueurMax="45" />
        <span v-if="permissionÉcrire">
          <boîteNoms
            :noms="nomsTableau"
            sousTitre="bd.vis.boîteNoms.sousTitre"
            etiquetteAucunNom="bd.vis.boîteNoms.aucunNom"
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
        <lien-orbite :lien="idTableau" />

        <v-spacer />
        <dialogue-exporter :id="idTableau" type="tableau">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon>
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
        </dialogue-exporter>
        <dialogue-Importer :id="idTableau" type="tableau">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon>
              <v-icon>mdi-upload</v-icon>
            </v-btn>
          </template>
        </dialogue-Importer>
      </v-card-title>
      <v-divider />

      <v-card-text>
        <tableau :idTableau="idTableau" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { traduireNom } from "@/utils";
import { bds } from "@constl/ipa";

import tableau from "@/components/tableaux/tableau.vue";

import imageÉditable from "@/components/commun/imageÉditable.vue";
import texteTronqué from "@/components/commun/texteTronqué.vue";
import boîteNoms from "@/components/commun/boîteNoms/boîte.vue";
import lienOrbite from "@/components/commun/lienOrbite.vue";
import dialogueExporter from "@/components/commun/dialogueExporter.vue";
import dialogueImporter from "@/components/commun/dialogueImporter.vue";

import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";
import mixinImage from "@/mixins/images";

const { MAX_TAILLE_IMAGE } = bds;

export default mixins(mixinLangues, mixinIPA, mixinImage).extend({
  name: "visTableau",
  components: {
    lienOrbite,
    texteTronqué,
    dialogueExporter,
    dialogueImporter,
    boîteNoms,
    imageÉditable,
    tableau,
  },
  mixins: [mixinLangues, mixinIPA, mixinImage],
  data: function () {
    return {
      permissionÉcrire: false,
      nomsTableau: {},
      nomsBD: {},
      logoBd: null as null | string,

      MAX_TAILLE_IMAGE,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.nomsTableau).length
        ? traduireNom(this.nomsTableau, this.languesPréférées)
        : this.idTableau;
    },
    nomBD: function (): string {
      return Object.keys(this.nomsBD).length
        ? traduireNom(this.nomsBD, this.languesPréférées)
        : this.idBd;
    },
    idBd: function (): string {
      return decodeURIComponent(this.$route.params.id);
    },
    imageBd: function (): string {
      return this.logoBd || this.image("logoBD");
    },
    idTableau: function (): string {
      return decodeURIComponent(this.$route.params.idTableau);
    },
    petitPousset: function (): {
      text: string;
      href?: string;
      disabled?: boolean;
    }[] {
      return [
        { text: this.$t("bd.visBD.தகவல்கள்") as string, href: "/bd" },
        {
          text: this.nomBD,
          href: `/bd/visualiser/${encodeURIComponent(this.idBd)}`,
        },
        {
          text: this.nom,
          disabled: true,
        },
      ];
    },
  },
  methods: {
    effacerImageBd: async function () {
      await this.$ipa.bds!.effacerImage({ idBd: this.idBd });
    },
    imageBdChoisie: async function ({
      données,
    }: {
      données: Uint8Array;
    }): Promise<void> {
      await this.$ipa.bds!.sauvegarderImage({
        idBd: this.idBd,
        image: données,
      });
    },
    sauvegarderNom({ langue, nom }: { langue: string; nom: string }) {
      this.$ipa.tableaux!.sauvegarderNomTableau({
        idTableau: this.idTableau,
        langue,
        nom,
      });
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
      this.$ipa.tableaux!.effacerNomTableau({
        idTableau: this.idTableau,
        langue: langueOriginale,
      });
      this.$ipa.tableaux!.sauvegarderNomTableau({
        idTableau: this.idTableau,
        langue,
        nom,
      });
    },
    effacerNom({ langue }: { langue: string }) {
      this.$ipa.tableaux!.effacerNomTableau({
        idTableau: this.idTableau,
        langue,
      });
    },
    initialiserSuivi: async function () {
      const oublierPermissionÉcrire = await this.$ipa.suivrePermissionÉcrire({
        id: this.idTableau,
        f: (permission) => (this.permissionÉcrire = permission || true),
      });

      const oublierNoms = await this.$ipa.tableaux!.suivreNomsTableau({
        idTableau: this.idTableau,
        f: (noms) => {
          this.nomsTableau = noms;
        },
      });

      const oublierNomsBd = await this.$ipa.bds!.suivreNomsBd({
        id: this.idBd,
        f: (noms) => {
          this.nomsBD = noms;
        },
      });

      const oublierImageBd = await this.$ipa.bds!.suivreImage({
        idBd: this.idBd,
        f: (logo) => {
          if (logo) {
            const url = URL.createObjectURL(
              new Blob([logo.buffer], { type: "image/png" })
            );
            this.logoBd = url;
          } else {
            this.logoBd = null;
          }
        },
      });

      this.suivre([
        oublierPermissionÉcrire,
        oublierNoms,
        oublierNomsBd,
        oublierImageBd,
      ]);
    },
  },
});
</script>

<style></style>
