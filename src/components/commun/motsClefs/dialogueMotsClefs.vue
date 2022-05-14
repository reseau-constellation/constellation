<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline">
        {{ $t("dialogueMotsClefs.Motsclefs") }}
      </v-card-title>
      <v-divider />

      <v-card-text>
        <v-skeleton-loader v-if="existants === null" type="paragraph" />
        <div v-else class="mt-3">
          <v-text-field
            v-model="recherche"
            outlined
            dense
            append-icon="mdi-magnify"
            class="my-3"
            hide-details
          ></v-text-field>
          <dialogue-nouveau-mot-clef @cree="nouveauMotClef">
            <template v-slot:activator="{ on, attrs }">
              <v-list-item v-bind="attrs" v-on="on">
                <v-list-item-content>
                  {{ $t("dialogueMotsClefs.motclef") }}
                </v-list-item-content>
                <v-list-item-action-text>
                  <v-icon>mdi-plus</v-icon>
                </v-list-item-action-text>
              </v-list-item>
            </template>
          </dialogue-nouveau-mot-clef>
          <v-divider />
          <v-list scrollable style="max-height: 200px" class="overflow-y-auto">
            <item-liste-mots-clefs
              v-for="m in motsClefsVisibles"
              :key="m"
              :id="m"
              @selectionne="selectionner(m)"
            />
            <div v-if="!motsClefsVisibles.length" class="text-center">
              <v-img :src="image('vide')" class="my-3" contain height="75px" />
              <p class="mt-2">{{ $t("dialogueMotsClefs.Aucunrésultat") }}</p>
            </div>
          </v-list>
        </div>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="dialogue = false">
          {{ $t("communs.fermer") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinIPA from "@/mixins/ipa";
import mixinImage from "@/mixins/images";
import dialogueNouveauMotClef from "@/components/commun/motsClefs/dialogueNouveauMotClef.vue";
import itemListeMotsClefs from "@/components/commun/motsClefs/itemListeMotsClefs.vue";

export default mixins(mixinIPA, mixinImage).extend({
  name: "dialogueMotsClefs",
  props: ["selectionnes"],
  components: { itemListeMotsClefs, dialogueNouveauMotClef },
  mixins: [mixinIPA, mixinImage],
  data: function () {
    return {
      dialogue: false,

      noms: {} as { [key: string]: string },
      existants: null as null | string[],
      récemmentAjouté: null as null | string,
      recherche: null as null | string,
    };
  },
  computed: {
    nonSélectionnés: function (): string[] {
      if (this.existants === null) return [];
      return this.existants.filter((m) => !this.selectionnes.includes(m));
    },
    motsClefsVisibles: function (): string[] {
      let listeFinale = [...this.nonSélectionnés];
      if (this.recherche) {
        listeFinale = listeFinale.filter((x) => x.includes(this.recherche!));
      }
      listeFinale = listeFinale.sort((_, b) =>
        b === this.récemmentAjouté ? 1 : 0
      );
      return listeFinale;
    },
  },
  methods: {
    creerMotClef: async function () {
      await this.$ipa.motsClefs!.créerMotClef();
    },
    selectionner: function (id: string) {
      this.$emit("ajouterMotClef", id);
      this.dialogue = false;
    },
    nouveauMotClef: async function ({ id }: { id: string }) {
      await this.creerMotClef();
      this.récemmentAjouté = id; // Montrer le nouveau mot clef en haut de la liste
    },
    initialiserSuivi: async function () {
      const oublierExistants = await this.$ipa.motsClefs!.suivreMotsClefs({
        f: (existants) => {
          this.existants = existants;
        },
      });
      this.suivre([oublierExistants]);
    },
  },
});
</script>
<style></style>
