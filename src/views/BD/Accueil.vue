<template>
  <v-container class="text-center">
    <titre :entête="$t('bd.entête')" />
    {{ idsBds }}
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
            <v-card-subtitle>{{
              $t("bd.nouvelle.détailsCarte")
            }}</v-card-subtitle>
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

<script>
import { obtBDs } from "@/ipa/bds";
import carteBd from "@/components/BD/carteBD";
import Titre from "@/components/commun/Titre";
import mixinIPA from "@/mixins/ipa";

export default {
  name: "BD",
  components: { carteBd, Titre },
  mixins: [mixinIPA],
  data: function() {
    return {
      idsBds: []
    };
  },
  methods: {
    initialiserSuivi: async function() {
      const oublierListeBDs = await this.$ipa.bds.suivreBDs(bds => {
        this.idsBds = bds
      });
      this.suivre(oublierListeBDs);
    }
  }
};
</script>

<style></style>
