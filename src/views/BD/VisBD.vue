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
              {{ item.text }}
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
        {{ couper(nom, 40) }}
        <span v-if="permissionÉcrire">
          <boîteNoms
            :noms="nomsBD"
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
        <span>
          <lien-orbite :lien="idBd" />
        </span>
        <v-spacer />
        <span>
          <dialogue-exporter :id="idBd" type="bd">
            <template v-slot:activator="{ on, attrs }">
              <v-tooltip v-bind="attrs" v-on="on" open-delay="200" bottom>
                <template
                  v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }"
                >
                  <span v-bind="tooltipAttrs" v-on="tooltipOn">
                    <v-btn v-bind="attrs" v-on="on" icon>
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                  </span>
                </template>
                <span>{{ $t("bd.vis.indiceTélécharger") }}</span>
              </v-tooltip>
            </template>
          </dialogue-exporter>

          <dialogue-copier-bd :id="idBd">
            <template v-slot:activator="{ on, attrs }">
              <v-tooltip v-bind="attrs" v-on="on" open-delay="200" bottom>
                <template
                  v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }"
                >
                  <span v-bind="tooltipAttrs" v-on="tooltipOn">
                    <v-btn v-bind="attrs" v-on="on" icon>
                      <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                  </span>
                </template>
                <span>{{ $t("bd.vis.indiceCopier") }}</span>
              </v-tooltip>
            </template>
          </dialogue-copier-bd>
        </span>

        <v-dialog
          v-if="permissionÉcrire"
          v-model="dialogueEffacerBd"
          width="500"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-tooltip open-delay="200" bottom>
              <template
                v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }"
              >
                <span v-bind="tooltipAttrs" v-on="tooltipOn">
                  <v-btn v-bind="attrs" v-on="on" icon color="error">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </span>
              </template>
              <span>{{ $t("bd.vis.indiceEffacer") }}</span>
            </v-tooltip>
          </template>
          <v-card>
            <v-card-title class="headline red--text">
              {{ $t("bd.visBD.நீக்கம்") }}
            </v-card-title>
            <v-card-text>
              {{ $t("bd.visBD.தரவுத்தளம்_அகற்றல்") }}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="error"
                text
                outlined
                @click="dialogueEffacerBd = false"
              >
                {{ $t("bd.visBD.இல்லை") }}
              </v-btn>
              <v-btn color="error" depressed @click="effacerBd">
                {{ $t("bd.visBD.நீக்கவும்") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-title>
      <v-card-subtitle>
        <span v-if="descriptionsBD">
          {{ description ? description : $t("bd.visBD.விளக்கம்") }}
        </span>
        <span v-if="permissionÉcrire">
          <boîteNoms
            :noms="descriptionsBD"
            titre="bd.vis.boîteDescr.titre"
            etiquetteAucunNom="bd.vis.boîteNoms.aucuneDescription"
            @sauvegarder="sauvegarderDescr"
            @changerLangue="changerLangueDescr"
            @effacer="effacerDescr"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-on="on" v-bind="attrs">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </boîteNoms>
        </span>
      </v-card-subtitle>
      <v-divider />
      <v-card-text>
        <v-card flat class="mx-3 mb-3">
          <p class="mb-0 text-overline">
            {{ $t("bd.visBD.செய்தி") }}
          </p>
          <div class="d-flex flex-wrap">
            <v-card flat width="200" class="mb-3">
              <dialogueQualité
                :score="score"
                :permissionModifier="permissionÉcrire"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item v-bind="attrs" v-on="on">
                    <v-list-item-avatar>
                      <v-skeleton-loader v-if="!score" type="avatar" />
                      <v-progress-circular
                        v-else
                        :rotate="270"
                        :width="5"
                        :value="score.total ? Math.round(score.total * 100) : 0"
                        :color="
                          score ? couleurScore(score.total).couleur : 'primary'
                        "
                      >
                        {{
                          score ? formatterChiffre(Math.round(score.total)) : ""
                        }}
                      </v-progress-circular>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      {{ $t("bd.visBD.மதிப்பெண்") }}
                      <span
                        v-if="score"
                        :style="`color:${couleurScore(score.total).couleur}`"
                        class="font-weight-bold"
                      >
                        {{
                          $t("carteBD.note." + couleurScore(score.total).note)
                        }}
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </dialogueQualité>
            </v-card>
            <v-card flat width="200" class="mb-3">
              <dialogue-auteurs
                :idBd="idBd"
                :auteurs="auteurs"
                :permissionModerateur="permissionModerateur"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item v-bind="attrs" v-on="on">
                    <v-list-item-avatar>
                      <v-icon left> mdi-account-multiple </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-skeleton-loader v-if="auteurs === null" type="chip" />
                      <span v-else>
                        {{
                          auteurs
                            ? $t("bd.visBD.எழுத்தாளர்கள்", {
                                n: formatterChiffre(auteurs.length),
                              })
                            : ""
                        }}
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </dialogue-auteurs>
            </v-card>
            <v-card flat width="200" class="mb-3">
              <dialogue-licence
                :idLicence="licence"
                :permissionModifier="permissionÉcrire"
                @changerLicence="changerLicence"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item v-bind="attrs" v-on="on">
                    <v-list-item-avatar>
                      <v-icon
                        left
                        :color="
                          licence && !licenceApprouvée ? 'error' : 'secondary'
                        "
                      >
                        mdi-scale-balance
                      </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-skeleton-loader v-if="licence === null" type="chip" />
                      <span v-else>
                        {{
                          couper(
                            licence && !licenceApprouvée
                              ? licence
                              : $t(
                                  `licences.info.${
                                    licence || "introuvable"
                                  }.abr`
                                ),
                            20
                          )
                        }}
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </dialogue-licence>
            </v-card>
            <v-card flat width="200" class="mb-3">
              <dialogueRéplications :replications="réplications">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item v-bind="attrs" v-on="on">
                    <v-list-item-avatar>
                      <v-icon left> mdi-database-sync </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-skeleton-loader
                        v-if="réplications === null"
                        type="chip"
                      />
                      <span v-else>
                        {{
                          réplications
                            ? $t("bd.visBD.நகல்கள்", {
                                n: formatterChiffre(
                                  réplications.dispositifs.length
                                ),
                              })
                            : ""
                        }}
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </dialogueRéplications>
            </v-card>
          </div>
        </v-card>
        <v-card flat class="mx-3 mb-3">
          <div class="d-flex flex-wrap">
            <v-card flat min-width="200" max-width="350" class="mb-3 me-3">
              <p class="mb-0 text-overline">
                {{ $t("bd.visBD.மாறிகள்") }}
              </p>
              <p v-if="!variables.length" class="text--disabled">
                {{ $t("bd.visBD.மாறி") }}
              </p>
              <jeton-variable v-for="id in variables" :key="id" :id="id" />
            </v-card>
            <v-card flat min-width="200" max-width="350" class="mb-3 me-3">
              <p class="mb-0 text-overline">
                {{ $t("bd.visBD.வார்த்தைகள்") }}
                <dialogue-ajouter-mots-clefs
                  v-if="permissionÉcrire"
                  :selectionnes="motsClefs"
                  @ajouterMotClef="ajouterMotClef"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      v-if="permissionÉcrire"
                      small
                      icon
                    >
                      <v-icon small> mdi-plus </v-icon>
                    </v-btn>
                  </template>
                </dialogue-ajouter-mots-clefs>
              </p>
              <p v-if="!motsClefs.length" class="text--disabled">
                {{ $t("bd.visBD.சிறப்பு_சொற்_இல்லை") }}
              </p>
              <jeton-mot-clef
                v-for="m in motsClefs"
                :key="m"
                :id="m"
                :permissionModifier="permissionÉcrire"
                @effacer="effacerMotClef"
              />
            </v-card>
            <v-card flat min-width="200" max-width="350" class="mb-3 me-3">
              <p class="mb-0 text-overline">
                {{ $t("bd.visBD.நிலவியல்") }}
              </p>
              <p v-if="!géog.length" class="text--disabled">
                {{ $t("bd.visBD.கண்டறிதல்") }}
              </p>
              <v-chip
                v-for="m in géog"
                :key="m"
                outlined
                small
                label
                class="mx-1 my-1"
                >{{ m }}</v-chip
              >
            </v-card>
          </div>
        </v-card>
        <v-list>
          <p class="mb-0 text-overline">
            {{ $t("bd.visBD.சித்திரங்கள்") }}
            <v-btn v-if="permissionÉcrire" icon small @click="ajouterTableau">
              <v-icon small>mdi-plus</v-icon>
            </v-btn>
          </p>
          <v-divider />
          <v-skeleton-loader v-if="tableaux === null" type="paragraph" />
          <div v-else-if="!tableaux.length" class="text-center">
            <p class="text-h5 mt-5">
              {{ $t("bd.visBD.அட்டவணைகள்") }}
            </p>
            <v-img :src="image('vide')" class="my-5" contain height="175px" />
            <v-btn
              v-if="permissionÉcrire"
              color="primary"
              class="mx-2"
              outlined
              text
              @click="ajouterTableau"
            >
              {{ $t("bd.visBD.சேர்க்கவும்") }}
            </v-btn>
            <v-btn
              v-if="permissionÉcrire"
              color="primary"
              class="mx-2"
              outlined
              text
            >
              {{ $t("bd.visBD.இறக்குமதி") }}
            </v-btn>
          </div>
          <transition-group
            v-else
            name="fade"
            mode="out-in"
            class="d-flex flex-wrap justify-center"
          >
            <item-tableau
              v-for="t in tableaux"
              :key="t"
              :id="t"
              :idBd="idBd"
              @click="
                $router.push(
                  `/bd/visualiser/${encodeURIComponent(
                    idBd
                  )}/tableau/${encodeURIComponent(t)}`
                )
              "
            />
          </transition-group>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { accès, bds, réseau, utils } from "@constl/ipa";

import { traduireNom, couper, couleurScore, ouvrirLien } from "@/utils";

import imageÉditable from "@/components/commun/imageÉditable.vue";
import dialogueQualité from "@/components/commun/dialogueQualité.vue";
import dialogueCopierBd from "@/components/BD/dialogueCopier.vue";
import dialogueExporter from "@/components/commun/dialogueExporter.vue";
import dialogueLicence from "@/components/commun/licences/dialogueLicence.vue";
import dialogueAjouterMotsClefs from "@/components/motsClefs/dialogueAjouterMotsClefs.vue";
import dialogueRéplications from "@/components/BD/réplications/dialogueRéplications.vue";
import dialogueAuteurs from "@/components/BD/auteurs/dialogueAuteurs.vue";
import boîteNoms from "@/components/commun/boîteNoms/boîte.vue";
import itemTableau from "@/components/BD/itemTableau.vue";
import lienOrbite from "@/components/commun/lienOrbite.vue";
import jetonVariable from "@/components/commun/jetonVariable.vue";
import jetonMotClef from "@/components/motsClefs/jetonMotClef.vue";

import mixinImage from "@/mixins/images";
import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";
import mixinLicences from "@/mixins/licences";

const { MAX_TAILLE_IMAGE } = bds;
const { MODÉRATEUR } = accès;

export default mixins(mixinImage, mixinLangues, mixinIPA, mixinLicences).extend(
  {
    name: "visBD",
    components: {
      itemTableau,
      lienOrbite,
      jetonVariable,
      jetonMotClef,
      imageÉditable,
      dialogueQualité,
      dialogueCopierBd,
      dialogueExporter,
      dialogueLicence,
      dialogueAuteurs,
      dialogueAjouterMotsClefs,
      dialogueRéplications,
      boîteNoms,
    },
    mixins: [mixinImage, mixinLangues, mixinIPA, mixinLicences],
    data: function () {
      return {
        dialogueEffacerBd: false,

        idBdCompte: undefined as undefined | string,
        licence: null as null | string,
        descriptionsBD: {} as { [key: string]: string },
        nomsBD: {} as { [key: string]: string },
        permissionÉcrire: false,
        tableaux: null as null | string[],
        logo: null as null | string,
        score: null as null | bds.infoScore,
        variables: [] as string[],
        réplications: null as null | réseau.infoRéplications,

        géog: [] as string[],
        motsClefs: [] as string[],
        auteurs: null as null | utils.infoAuteur[],

        MAX_TAILLE_IMAGE,
      };
    },
    computed: {
      langues: function (): string[] {
        return [this.$i18n.locale, ...(this.$i18n.fallbackLocale as string[])];
      },
      nom: function (): string {
        return Object.keys(this.nomsBD).length
          ? traduireNom(this.nomsBD, this.langues)
          : this.idBd;
      },
      description: function (): string {
        return traduireNom(this.descriptionsBD, this.langues);
      },
      imageBd: function (): string {
        return this.logo || this.image("logoBD");
      },
      idBd: function (): string {
        return decodeURIComponent(this.$route.params.id);
      },
      petitPousset: function (): {
        text: string;
        href?: string;
        disabled?: boolean;
      }[] {
        return [
          { text: this.$t("bd.visBD.தகவல்கள்") as string, href: "/bd" },
          { text: couper(this.nom, 35), disabled: true },
        ];
      },
      permissionModerateur: function (): boolean {
        if (!this.auteurs) return false;
        const accèsMod = this.auteurs.find(
          (a) => a.idBdCompte === this.idBdCompte && a.rôle === MODÉRATEUR
        );
        return Boolean(accèsMod);
      },
    },

    methods: {
      couper,
      couleurScore,
      ouvrirLien,
      ajouterTableau: async function (): Promise<void> {
        await this.$ipa.bds!.ajouterTableauBd({ id: this.idBd });
      },
      ajouterMotClef: async function (idMotClef: string): Promise<void> {
        await this.$ipa.bds!.ajouterMotsClefsBd({
          idBd: this.idBd,
          idsMotsClefs: idMotClef,
        });
      },
      effacerBd: async function (): Promise<void> {
        await this.$ipa.bds!.effacerBd({ id: this.idBd });
        this.$router.push("/bd");
      },
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
      sauvegarderNom: async function ({
        langue,
        nom,
      }: {
        langue: string;
        nom: string;
      }): Promise<void> {
        await this.$ipa.bds!.sauvegarderNomBd({ id: this.idBd, langue, nom });
      },
      changerLangueNom: async function ({
        langueOriginale,
        langue,
        nom,
      }: {
        langueOriginale: string;
        langue: string;
        nom: string;
      }): Promise<void> {
        await this.$ipa.bds!.effacerNomBd({
          id: this.idBd,
          langue: langueOriginale,
        });
        await this.$ipa.bds!.sauvegarderNomBd({ id: this.idBd, langue, nom });
      },
      effacerNom: async function ({
        langue,
      }: {
        langue: string;
      }): Promise<void> {
        await this.$ipa.bds!.effacerNomBd({ id: this.idBd, langue });
      },
      sauvegarderDescr: async function ({
        langue,
        nom,
      }: {
        langue: string;
        nom: string;
      }): Promise<void> {
        await this.$ipa.bds!.sauvegarderDescrBd({
          id: this.idBd,
          langue,
          descr: nom,
        });
      },
      changerLangueDescr: async function ({
        langueOriginale,
        langue,
        nom,
      }: {
        langueOriginale: string;
        langue: string;
        nom: string;
      }): Promise<void> {
        await this.$ipa.bds!.effacerDescrBd({
          id: this.idBd,
          langue: langueOriginale,
        });
        await this.$ipa.bds!.sauvegarderDescrBd({
          id: this.idBd,
          langue,
          descr: nom,
        });
      },
      effacerDescr: async function ({
        langue,
      }: {
        langue: string;
      }): Promise<void> {
        await this.$ipa.bds!.effacerDescrBd({ id: this.idBd, langue });
      },
      effacerMotClef: async function ({ id }: { id: string }): Promise<void> {
        await this.$ipa.bds!.effacerMotClefBd({
          idBd: this.idBd,
          idMotClef: id,
        });
      },
      changerLicence: async function ({
        licence,
      }: {
        licence: string;
      }): Promise<void> {
        await this.$ipa.bds!.changerLicenceBd({ idBd: this.idBd, licence });
      },
      initialiserSuivi: async function () {
        const oublierPermissionÉcrire = await this.$ipa.suivrePermissionÉcrire({
          id: this.idBd,
          f: (permission) => (this.permissionÉcrire = permission),
        });

        const oublierIdBdRacine = await this.$ipa.suivreIdBdCompte({
          f: (id: string | undefined) => (this.idBdCompte = id),
        });

        const oublierImage = await this.$ipa.bds!.suivreImage({
          idBd: this.idBd,
          f: (logo) => {
            if (logo) {
              const url = URL.createObjectURL(
                new Blob([logo.buffer], { type: "image/png" })
              );
              this.logo = url;
            } else {
              this.logo = null;
            }
          },
        });

        const oublierLicence = await this.$ipa.bds!.suivreLicence({
          id: this.idBd,
          f: (licence: string) => {
            this.licence = licence;
          },
        });
        const oublierAuteurs = await this.$ipa.réseau!.suivreAuteursBd({
          idBd: this.idBd,
          f: (auteurs) => {
            this.auteurs = auteurs;
          },
        });
        const oublierNoms = await this.$ipa.bds!.suivreNomsBd({
          id: this.idBd,
          f: (noms: { [key: string]: string }) => {
            this.nomsBD = noms;
          },
        });
        const oublierDescriptions = await this.$ipa.bds!.suivreDescrBd({
          id: this.idBd,
          f: (descriptions: { [key: string]: string }) => {
            this.descriptionsBD = descriptions;
          },
        });
        const oublierTableaux = await this.$ipa.bds!.suivreTableauxBd({
          id: this.idBd,
          f: (tableaux: string[]) => {
            this.tableaux = tableaux;
          },
        });
        const oublierScore = await this.$ipa.bds!.suivreScoreBd({
          id: this.idBd,
          f: (score) => (this.score = score),
        });
        const oublierVariables = await this.$ipa.bds!.suivreVariablesBd({
          id: this.idBd,
          f: (variables: string[]) => (this.variables = variables),
        });
        const oublierMotsClefs = await this.$ipa.bds!.suivreMotsClefsBd({
          id: this.idBd,
          f: (motsClefs: string[]) => (this.motsClefs = motsClefs),
        });
        const { fOublier: oublierRéplications } =
          await this.$ipa.réseau!.suivreRéplications({
            idObjet: this.idBd,
            f: (réplications) => {
              this.réplications = réplications;
            },
          });
        this.suivre([
          oublierPermissionÉcrire,
          oublierIdBdRacine,
          oublierImage,
          oublierLicence,
          oublierAuteurs,
          oublierNoms,
          oublierDescriptions,
          oublierTableaux,
          oublierScore,
          oublierVariables,
          oublierMotsClefs,
          oublierRéplications,
        ]);
      },
    },
  }
);
</script>

<style></style>
