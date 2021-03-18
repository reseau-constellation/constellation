<template>
  <v-container>
    <v-card flat>
      <v-card-subtitle>
        <v-breadcrumbs :items="petitPousset" class="pa-0">
          <template v-slot:divider>
            <v-icon>{{ $vuetify.rtl ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
          </template>
          <template v-slot:item="{ item }">
            <v-breadcrumbs-item
              :disabled="item.disabled"
              @click="$router.push(item.href)"
            >
              {{ item.text }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
      </v-card-subtitle>
      <v-img
        :src="(bd && bd.logo) ? bd.logo : require('@/assets/undraw/undraw_Projections_re_1mrh.svg')"
        height="100px"
        contain
      ></v-img>
      <v-card-title v-if="this.bd">
        {{ nom }}
        <v-btn icon>
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-spacer/>
        <v-btn icon>
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn icon color="error">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle>{{ idBD }}</v-card-subtitle>

      <v-divider/>
      <v-card-text>
        <p class="mb-0 text-overline">Mots-clefs</p>
        <div v-if="bd" class="ms-2">
          <v-chip v-for="m in bd.motsClefs" :key="m"
           close outlined small label class="ma-2" close-icon="mdi-close"
          >{{ m }}</v-chip>
          <v-chip small outlined label class="ma-2">
            Ajouter
            <v-icon right>
              mdi-plus
            </v-icon>
          </v-chip>
        </div>

        <p class="mb-0 text-overline">Emplacement géographique</p>
        <div v-if="bd" class="ms-2">
          <v-chip v-for="m in bd.emplacement" :key="m"
           outlined small label class="ma-2"
          >{{ m }}</v-chip>
        </div>

        <p class="mb-0 text-overline">Variables</p>
        <div v-if="bd" class="ms-2">
          <v-chip v-for="m in bd.variables" :key="m"
           outlined small label class="ma-2"
          >{{ m }}</v-chip>
        </div>

        <v-list>
          <p class="mb-0 text-overline">Contrôle de qualité</p>
          <v-divider/>
          <transition-group
            name="fade"
            mode="out-in"
            class="d-flex flex-wrap justify-center"
            v-if="bd"
          >
          </transition-group>
        </v-list>

        <v-list>
          <p class="mb-0 text-overline">Intégrations</p>
          <v-divider/>
          <transition-group
            name="fade"
            mode="out-in"
            class="d-flex flex-wrap justify-center"
            v-if="bd"
          >
          </transition-group>
        </v-list>

        <v-list>
          <p class="mb-0 text-overline">Tableaux</p>
          <v-divider/>
          <transition-group
            name="fade"
            mode="out-in"
            class="d-flex flex-wrap justify-center"
            v-if="bd"
          >
            <item-tableau
             v-for="t in bd.tableaux" :key="t" :id="t"
             @click="$router.push(`/tableau/visualiser/${t}`)"
            />
          </transition-group>
        </v-list>

      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { BDParId } from "@/ipa/bds"
import { nomBD } from '@/ipa/utils'
import itemTableau from '@/components/BD/itemTableau'

export default {
  name: "visBD",
  components: { itemTableau },
  data: function() {
    return {
      bd: null
    }
  },
  computed: {
    nom: function() {
      const lngs = [this.$i18n.locale, ...this.$i18n.fallbackLocale];
      return nomBD(this.bd, lngs)
    },
    idBD: function() {
      return this.$route.params.id
    },
    petitPousset: function() {
      return [
        {text: 'Données', href: '/bd'},
        {text: this.bd ? this.nom : this.idBD}
      ]
    }
  },
  mounted: function() {
    BDParId(this.idBD).then(bd=>{this.bd = bd})
  }
}
</script>

<style>

</style>
