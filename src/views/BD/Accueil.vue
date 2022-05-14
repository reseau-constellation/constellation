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
          <nouvelle-bd :key="0">
            <template v-slot:activator="{ on, attrs }">
              <v-card
                v-bind="attrs"
                v-on="on"
                class="mx-4 my-5 px-3 py-5 justify-start text-start"
                min-height="200px"
                max-width="300px"
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
                  {{ $t("bd.nouvelle.détailsCarte") }}</v-card-subtitle
                >
                <v-card-text></v-card-text>
              </v-card>
            </template>
          </nouvelle-bd>

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

import Titre from "@/components/commun/Titre.vue";
import carteBd from "@/components/BD/carteBD.vue";
import nouvelleBd from "@/components/BD/NouvelleBD.vue";

import mixinIPA from "@/mixins/ipa";

export default mixins(mixinIPA).extend({
  name: "BD",
  components: { Titre, carteBd, nouvelleBd },
  mixins: [mixinIPA],
  data: function () {
    return {
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
