<template>
  <v-dialog v-model="dialogue" scrollable>
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline mb-3">
        {{ $t("dialogueTraductionsInterface.மொழிபெயர்க்கவும்") }}
        <v-spacer />
        <v-btn icon>
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon @click="dialogue = false">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle>
        <v-icon left small>mdi-information-outline</v-icon>
        {{ $t("dialogueTraductionsInterface.சேர்த்தல்") }}
      </v-card-subtitle>
      <v-card outlined>
        <div class="d-flex flex-wrap align-center">
          <v-card flat max-width="200" class="ma-3">
            <v-autocomplete
              :items="
                langues.map((l) => {
                  return { text: codeÀNomLangue(l) || l, value: l };
                })
              "
              :value="langueSource"
              class="mx-2 my-2"
              outlined
              dense
              hide-details
              :label="$t('dialogueTraductionsInterface.Languesource')"
              @change="changerLangueSource"
            >
              <template v-slot:item="{ item }">
                <op-langue
                  :code="item.value"
                  :sélectionnée="item.value === langueSource"
                  :progrès="progrès(item.value)"
                />
              </template>
            </v-autocomplete>
          </v-card>
          <v-card flat max-width="200" class="ma-3">
            <v-icon @click="() => échangerLangues()"
              >mdi-swap-horizontal</v-icon
            >
          </v-card>
          <v-card flat max-width="200" class="ma-3">
            <v-select
              :items="
                langues.map((l) => {
                  return { text: codeÀNomLangue(l) || l, value: l };
                })
              "
              :value="langueCible"
              class="mx-2 my-2"
              outlined
              dense
              hide-details
              :label="$t('dialogueTraductionsInterface.Languecible')"
              @change="changerLangueCible"
            >
              <template v-slot:item="{ item }">
                <op-langue
                  :code="item.value"
                  :sélectionnée="item.value === langueCible"
                  :progrès="progrès(item.value)"
                />
              </template>
            </v-select>
          </v-card>
          <v-card flat max-width="200" class="ma-3">
            <v-checkbox
              v-model="cacherTraduits"
              class="my-auto"
              :label="$t('dialogueTraductionsInterface.cacherTraduits')"
              hide-details
            />
          </v-card>
        </div>
      </v-card>

      <v-card-text class="mt-3">
        <v-row>
          <v-col cols="4">
            <div
              v-if="!messagesÀMontrer.length"
              class="pt-10 text-center"
              style="height: 400px"
            >
              <h2>
                {{ $t("dialogueTraductionsInterface.rienÀTraduire") }}
              </h2>
            </div>
            <v-virtual-scroll
              v-else
              :items="messagesÀMontrer"
              height="400"
              :item-height="61.99"
            >
              <template v-slot:default="{ item }">
                <item-liste-trads
                  :key="item.clef"
                  :clef="item.clef"
                  :texteOriginal="item.texteOriginal"
                  :traduction="item.traduction"
                  :active="item.clef === clefSélectionnée"
                  @click="() => sélectionner(item.clef)"
                />
              </template>
            </v-virtual-scroll>
          </v-col>
          <v-col cols="8">
            <panneau-traduction
              :clef="clefSélectionnée"
              :texteOriginal="messageOriginal"
              :langueCible="langueCible"
              :langueSource="langueSource"
              @annuler="clefSélectionnée = null"
            />
          </v-col>
        </v-row>
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

import { rubiChabäl as codeÀNomLangue } from "nuchabal";

import avatarProfil from "@/components/commun/avatarProfil.vue";
import panneauTraduction from "@/components/commun/traductions/panneauTraduction.vue";
import itemListeTrads from "@/components/commun/traductions/itemListeTrads.vue";

import opLangue from "@/components/commun/OpLangue.vue";
import mixinLangues from "@/mixins/langues";

interface messageTrad {
  clef: string;
  texteOriginal?: string;
  traduction?: string;
}

export default mixins(mixinLangues).extend({
  name: "dialogueTraductionsInterface",
  mixins: [mixinLangues],
  components: { opLangue, avatarProfil, itemListeTrads, panneauTraduction },
  data: function () {
    return {
      dialogue: false,

      langueSource: null as null | string,
      langueCible: null as null | string,
      clefSélectionnée: null as null | string,
      messageOriginal: null as null | string,
      cacherTraduits: true,
    };
  },
  computed: {
    messages: function (): messageTrad[] {
      return this.clefsMessages().map((clef) => {
        const originale = this.langueSource
          ? this.traduireClef(clef, [this.langueSource, this.langueOriginale])
          : undefined;
        const traduction = this.langueCible
          ? this.traduireClef(clef, [this.langueCible])
          : undefined;

        return {
          clef,
          texteOriginal: originale ? originale.trad : undefined,
          traduction: traduction ? traduction.trad : undefined,
        };
      });
    },
    messagesÀMontrer: function (): messageTrad[] {
      return this.cacherTraduits
        ? this.messages.filter((m) => !m.traduction)
        : this.messages;
    },
  },
  watch: {
    clefSélectionnée: function () {
      const message = this.messages.find(
        (m) => m.clef === this.clefSélectionnée
      );
      this.messageOriginal = message?.texteOriginal || "";
    },
  },
  methods: {
    codeÀNomLangue,
    changerLangueCible: function (langue: string) {
      this.langueCible = langue;
    },
    changerLangueSource: function (langue: string) {
      this.langueSource = langue;
    },
    échangerLangues: function () {
      const langueSource = this.langueSource;
      const langueCible = this.langueCible;

      this.langueSource = langueCible;
      this.langueCible = langueSource;
    },
    sélectionner: function (clef: string) {
      this.clefSélectionnée = clef;
    },
  },
  mounted: function () {
    this.langueSource = this.langueOriginale;
    this.langueCible =
      this.langueOriginale !== this.langue
        ? this.langue
        : this.languesRécentes.find((l) => l !== this.langueSource) ||
          this.langues.find((l) => l !== this.langueSource) ||
          null;
  },
});
</script>

<style></style>
