<template>
  <v-container class="text-center">
    <titre :entête="$t('bd.entête')" />
    <v-row>
      <v-col cols="12">
        <v-text-field
          outlined
          append-icon="mdi-filter"
          :label="$t('bd.filtrer')"
          class="mx-10"
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-slide-x-transition group class="d-flex flex-wrap justify-center">
          <v-card
            :key="0"
            class="mx-4 my-5 px-3 py-5 justify-start text-start"
            min-height="200px"
            max-width="300px"
            @click="$router.push('/bd/nouvelle')"
          >
            <v-img
              :src="require('@/assets/undraw/undraw_blank_canvas_3rbb.svg')"
              height="100px"
              contain
            ></v-img>

            <v-card-title
              >{{ $t("bd.nouvelle.entêteCarte") }}
              <v-spacer />
            </v-card-title>
            <v-divider />
            <v-card-subtitle>
              {{ $t("bd.nouvelle.détailsCarte") }}</v-card-subtitle>
            <v-card-text></v-card-text>
          </v-card>
          <carte-bd
            v-for="id in idsBds"
            :key="id"
            :bd="id"
            @click="$router.push(`bd/visualiser/${encodeURIComponent(id)}`)"
          />
        </v-slide-x-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import carteBd from "@/components/BD/carteBD.vue";
import Titre from "@/components/commun/Titre.vue";

import mixinIPA from "@/mixins/ipa";

export default mixins(mixinIPA).extend({
  name: "BD",
  components: { carteBd, Titre },
  mixins: [mixinIPA],
  data: function () {
    return {
      idsBds: [] as string[],
    };
  },
  methods: {
    initialiserSuivi: async function () {
      const oublierListeBDs = await this.$ipa.bds!.suivreBds((bds) => {
        this.idsBds = bds;
      });
      this.suivre(oublierListeBDs);
    },
  },
});
</script>

<style></style>
