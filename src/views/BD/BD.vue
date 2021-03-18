<template>
  <v-container class="text-center">
    <titre
      :entête="$t('bd.entête')"
    />
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
        <transition-group
          name="fade"
          mode="out-in"
          class="d-flex flex-wrap justify-center"
        >
          <v-card
            :key="0"
            class="mx-4 my-5 px-3 py-5 justify-start text-start"
            min-height="200px"
            width="250px"
          >
            <v-img
              :src="require('@/assets/undraw/undraw_blank_canvas_3rbb.svg')"
              height="100px"
              contain
            ></v-img>

            <v-card-title
              >{{ $t("bd.nouveau.entête") }}
              <v-spacer />
            </v-card-title>
            <v-divider />
            <v-card-subtitle>{{ $t("bd.nouveau.détails") }}</v-card-subtitle>
            <v-card-text> </v-card-text>
          </v-card>
          <carte-bd v-for="bd in bds" :key="bd.id" :bd="bd"
          @click="$router.push(`bd/visualiser/${bd.id}`)" />
        </transition-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { obtBDs } from "@/ipa/bds";
import carteBd from "@/components/BD/carteBD";
import Titre from "@/components/commun/Titre"

export default {
  name: "BD",
  components: { carteBd, Titre },
  data: function() {
    return {
      bds: []
    };
  },
  mounted: async function() {
    for await (const b of obtBDs()) {
      this.bds = [...this.bds, b];
    }
  }
};
</script>

<style></style>
