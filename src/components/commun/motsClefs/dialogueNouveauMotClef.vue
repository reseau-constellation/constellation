<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline"> Nouveau mot clef </v-card-title>
      <v-divider />

      <v-card-text>
        <v-skeleton-loader v-if="existants === null" type="paragraph" />
        <div v-else>
          <div class="text-center">
            <v-btn color="secondary" text outlined @click="creerMotClef">
              <v-icon left>mdi-plus</v-icon>
              Nouveau mot clef
            </v-btn>
          </div>
          <div v-if="nonSélectionnés.length">
            <v-text-field
              outlined
              dense
              append-icon="mdi-magnify"
              class="mx-10"
            ></v-text-field>
            <v-list>
              <item-liste-mots-clefs
                v-for="m in nonSélectionnés"
                :key="m"
                :id="m"
                @selectionne="selectionner(m)"
              />
            </v-list>
          </div>
          <div v-else>
            <p class="text-h5 mt-5">Aucun autre mot clef disponible</p>
            <v-img :src="image('vide')" class="my-5" contain height="125px" />
          </div>
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

<script>
import mixinIPA from "@/mixins/ipa";
import mixinImage from "@/mixins/images";

import itemListeMotsClefs from "@/components/commun/motsClefs/itemListeMotsClefs";

export default {
  name: "dialogueNouveauMotClef",
  components: { itemListeMotsClefs },
  mixins: [mixinIPA, mixinImage],
  data: function () {
    return {
      noms: {},
      existants: null,
      dialogue: false,
    };
  },
  methods: {
    creerMotClef: async function () {
      await this.$ipa.motsClefs.créerMotClef();
    },
    selectionner: function (id) {
      this.$emit("ajouterMotClef", id);
      this.dialogue = false;
    },
    initialiserSuivi: async function () {
      const oublierExistants = await this.$ipa.motsClefs.suivreMotsClefs(
        (existants) => {
          this.existants = existants;
        }
      );
      this.suivre([oublierExistants]);
    },
  },
};
</script>

<style></style>
