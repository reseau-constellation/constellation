<template>
  <span>
    <nouvelle-bd :key="0">
      <template v-slot:activator="{ on, attrs }">
        <slot name="activator" v-bind="{ on, attrs }"></slot>
          <v-card
           v-on="on"
           v-bind="attrs"
            >
            <v-list-item-title>
              <v-list-item-avatar>
               <v-img
                 :src="require('@/assets/undraw/undraw_blank_canvas_3rbb.svg')"
                 height="50px"
                 contain
                 ></v-img>
                 </v-list-item-avatar>
                 {{ $t("bd.nouvelle.entêteCarte") }}
                 </v-list-item-title>
              <v-list-item-subtitle>
            <p class="grey--text text--darken-1">
           {{ $t("bd.nouvelle.détailsCarte") }}
        </p></v-list-item-subtitle>
      </v-card>
    </template>
  </nouvelle-bd>

      <carte-bd
        v-for="id in idsBds"
        :key="id"
        :bd="id"
        @click="$router.push(`bd/visualiser/${encodeURIComponent(id)}`)"
      />
   </span>
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
