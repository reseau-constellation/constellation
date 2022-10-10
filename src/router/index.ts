import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Accueil from "@/views/Accueil.vue";
import { i18n } from '@/plugins/vuetify'

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Accueil",
    component: Accueil,
  },
  {
    path: "/compte",
    name: "Compte",
    component: () => import("@/views/Compte.vue"),
  },
  {
    path: "/bd",
    name: "Bases de données",
    component: () => import("@/views/MesDonnées.vue"),
  },
  {
    path: "/bd/visualiser/:id",
    component: () => import("@/views/BD/VisBD.vue"),
  },
  {
    path: "/bd/visualiser/:id/tableau/:idTableau",
    component: () => import("@/views/BD/VisTableau.vue"),
  },
  {
    path: "/recherche",
    name: "Recherche",
    component: () => import("@/views/Recherche.vue"),
  },
  {
    path: "/favoris",
    name: "Favoris",
    component: () => import("@/views/Favoris.vue"),
  },
  {
    path: "/automatisation",
    name: "Automatisation",
    component: () => import("@/views/Automatisation.vue"),
  },
  {
    path: "/signalements",
    name: "Signalements",
    component: () => import("@/views/Signalements.vue"),
  },
  {
    path: "/conditions",
    name: "Conditions",
    component: () => import("@/views/Conditions.vue"),
  },
  { path: "*", redirect: "/" },
  {
    path: encodeURI("/téléchargements"),
    name: "Téléchargements",
    component: () => import("@/views/Téléchargements.vue"),
  },
];

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? "hash" : "history",
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

router.afterEach((to) => {
  const { lg } = to.query
  console.log(to.query)
  if (lg && typeof lg === "string"){
    i18n.locale = lg
    console.log(i18n.locale)
  }
})

export default router;
