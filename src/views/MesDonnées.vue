<template>
  <v-container class="text-center">
    <titre :entête="$t('bd.entête')" />
    <v-row>
      <v-col cols="12" v-if="false">
        <v-text-field
          outlined
          append-icon="mdi-filter"
          hide-details
          :label="$t('bd.filtrer')"
          class="mx-10"
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-chip-group
          v-model="typeObjetSélectionné"
          class="mx-10"
          mandatory
          active-class="primary--text"
        >
          <v-chip v-for="typeObjet in typesObjets" :key="typeObjet">
            {{ $t("données.choixTypeObjet." + typeObjet) }}
          </v-chip>
        </v-chip-group>
      </v-col>
      <v-col cols="12">
        <v-slide-x-transition group class="d-flex flex-wrap mx-10">
          <tous-motsclefs v-if="typeObjetSélectionné === 0" :key="0" />
          <toutes-variables v-if="typeObjetSélectionné === 1" :key="1" />
          <toutes-bds v-if="typeObjetSélectionné === 2" :key="2" />
        </v-slide-x-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import Titre from "@/components/commun/Titre.vue";
import carteBd from "@/components/BD/carteBD.vue";
import nouvelleBd from "@/components/BD/NouvelleBD.vue";
import tousMotsclefs from "@/components/motsClefs/tous.vue";
import toutesVariables from "@/components/variables/Toutes.vue";
import toutesBds from "@/components/BD/Toutes.vue";

import mixinIPA from "@/mixins/ipa";

export default mixins(mixinIPA).extend({
  name: "BD",
  components: { Titre, carteBd, nouvelleBd, tousMotsclefs, toutesVariables, toutesBds },
  mixins: [mixinIPA],
  data: function () {
    return {
      typeObjetSélectionné: 2,
      typesObjets: ["mots-clefs", "variables", "bds", ], // "projets"],
      idsBds: [] as string[],
    };
  },
  methods: {
    initialiserSuivi: async function () {
      const oublierListeBDs = await this.$ipa.bds!.suivreBds({
        f: (bds) => {
          this.idsBds = bds;
        },
      });
      this.suivre(oublierListeBDs);
    },
  },
});
</script>

<style></style>
