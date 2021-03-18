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
        {{ nom }}</v-card-title>
      <v-card-subtitle>{{ idBD }}</v-card-subtitle>
      <v-card-text>
        <v-data-table
         :headers="entête"
         :items="données"
        >
        <template
          v-slot:no-data
        >
          {{ $t('tableau.vide') }}
        </template>
        </v-data-table>

      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { BDParId } from "@/ipa/bds"
import { nomBD } from '@/ipa/utils'

export default {
  name: "visTableau",
  data: function() {
    return {
      données: [
        { date: '2000-01-01', préc: '2', tmax: '24', tmin: '18' },
        { date: '2000-01-02', préc: '0', tmax: '22', tmin: '13' },
      ],
      entête: [
        { text: 'Date', value: 'date' },
        { text: 'Précipitation', value: 'préc' },
        { text: 'Température max', value: 'tmax' },
        { text: 'Température min', value: 'tmin' },
      ]
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
        {text: this.tableau, href: `/bd/`},
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
