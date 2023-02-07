<template>
  <span>
   <nouvelle-bd :key="0">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
        <v-btn
          v-bind="attrs"
          v-on="on"
          height="75"
          width="1100"
          text
           >
         <v-list-item>
          <v-list-item-avatar>
            <v-icon>mdi-plus</v-icon>
           </v-list-item-avatar>
            <div class="text-left">
              <v-list-item-content>
               <v-list-item-title>
                {{ $t("bd.nouvelle.entêteCarte") }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ $t("bd.nouvelle.détailsCarte") }}
                 </v-list-item-subtitle>
               </v-list-item-content>
             </div>
           </v-list-item>
         </v-btn>
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
  components: { Titre, carteBd,nouvelleBd },
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
