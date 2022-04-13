<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline mb-2">
        {{ $t("dialogueRéplications.நகல்கள்") }}
      </v-card-title>
      <v-card-subtitle>
        {{ $t("dialogueRéplications.விண்மீன்_தரவு") }}
      </v-card-subtitle>
      <v-divider />
      <v-card-text>
        <div class="mt-3">
          <v-skeleton-loader v-if="!replications" type="paragraph@2" />
          <div v-else>
            <p class="mb-0 text-overline">
              {{ $t("dialogueRéplications.நகலெடுக்கப்பட்டது") }}
            </p>
            <v-list-item two-line>
              <v-avatar class="me-3 text-h3">
                {{ dispositifs.length }}
              </v-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t("dialogueRéplications.சாதனங்கள்") }}
                  <v-icon right>mdi-monitor-cellphone</v-icon>
                </v-list-item-title>
                <v-list-item-subtitle class="success--text">
                  {{
                    $t("dialogueRéplications.enLigne", {
                      n: dispositifsEnLigne.length,
                    })
                  }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <p class="mb-0 text-overline">
              {{ $t("dialogueRéplications.Représentant") }}
            </p>
            <v-list-item two-line>
              <v-avatar class="me-3 text-h3">
                {{ membres.length }}
              </v-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t("dialogueRéplications.Membres") }}
                  <v-icon right>mdi-account</v-icon>
                </v-list-item-title>
                <v-list-item-subtitle class="success--text"
                  >{{
                    $t("dialogueRéplications.enLigne", {
                      n: membresEnLigne.length,
                    })
                  }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
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

<script lang="ts">
import mixins from "vue-typed-mixins";
import { PropType } from "vue";

import mixinLangues from "@/mixins/langues";

import { favoris, réseau } from "@constl/ipa";

const DÉLAI_EN_LIGNE = 10000;

export default mixins(mixinLangues).extend({
  name: "dialogueRéplications",
  props: {
    replications: Object as PropType<réseau.infoRéplications>,
  },
  mixins: [mixinLangues],
  data: function () {
    return {
      dialogue: false,
      maintenant: new Date().getTime(),
    };
  },
  computed: {
    dispositifs: function (): (favoris.épingleDispositif & {
      idDispositif: string;
      vuÀ?: number;
    })[] {
      return this.replications.dispositifs;
    },
    dispositifsEnLigne: function (): (favoris.épingleDispositif & {
      idDispositif: string;
      vuÀ?: number;
    })[] {
      return this.dispositifs.filter((d) =>
        d.vuÀ ? this.maintenant - d.vuÀ <= DÉLAI_EN_LIGNE : false
      );
    },
    membres: function (): réseau.statutMembre[] {
      return this.replications.membres;
    },
    membresEnLigne: function (): réseau.statutMembre[] {
      return this.membres.filter((m) =>
        m.vuÀ ? this.maintenant - m.vuÀ <= DÉLAI_EN_LIGNE : false
      );
    },
  },
  mounted: function () {
    setInterval(() => {
      this.maintenant = new Date().getTime();
    }, 1000);
  },
});
</script>

<style></style>
