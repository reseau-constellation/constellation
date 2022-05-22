<template>
  <v-list>
    <v-slide-x-transition
      group
      class="d-flex flex-wrap justify-center text-start"
    >
      <dialogue-nouveau-motclef :key="0">
        <template v-slot:activator="{ on, attrs }">
          <v-list-item v-bind="attrs" v-on="on">
            <v-list-item-avatar>
              <v-icon>mdi-plus</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t("dialogueNouveauMotClef.motclef") }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t("dialogueNouveauMotClef.sousTitre")
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>
      </dialogue-nouveau-motclef>
      <dialogue-info-motclef v-for="id in idsMotsClefs" :key="id" :id="id">
        <template v-slot:activator="{ on, attrs }">
          <item-liste-motsclefs :id="id" v-bind="attrs" v-on="on" />
        </template>
      </dialogue-info-motclef>
    </v-slide-x-transition>
    <v-skeleton-loader
      v-if="idsMotsClefs === undefined"
      type="list-item-avatar-two-line@2"
    />
  </v-list>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";
import mixinIPA from "@/mixins/ipa";

import Titre from "@/components/commun/Titre.vue";
import dialogueNouveauMotclef from "@/components/motsClefs/dialogueNouveauMotClef.vue";
import itemListeMotsclefs from "@/components/motsClefs/itemListeMotsClefs.vue";
import dialogueInfoMotclef from "@/components/motsClefs/dialogueInfoMotClef.vue";

export default mixins(mixinIPA).extend({
  name: "mesMotsClefs",
  components: {
    Titre,
    dialogueNouveauMotclef,
    itemListeMotsclefs,
    dialogueInfoMotclef,
  },
  mixins: [mixinIPA],
  data: function () {
    return {
      idsMotsClefs: undefined as undefined | string[],
    };
  },
  methods: {
    initialiserSuivi: async function () {
      const oublierListeMotsClefs = await this.$ipa.motsClefs!.suivreMotsClefs({
        f: (motsClefs) => {
          this.idsMotsClefs = motsClefs;
        },
      });
      this.suivre(oublierListeMotsClefs);
    },
  },
});
</script>

<style></style>
