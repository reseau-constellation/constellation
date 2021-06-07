import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Accueil from "@/views/Accueil.vue";

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
    path: "/projets",
    name: "Projets",
    component: () => import("@/views/Projets/Projets.vue"),
  },
  {
    path: "/bd",
    name: "Bases de données",
    component: () => import("@/views/BD/Accueil.vue"),
  },
  {
    path: "/bd/nouvelle",
    component: () => import("@/views/BD/Nouvelle.vue"),
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
    path: "/automation",
    name: "Automation",
    component: () => import("@/views/Automation.vue"),
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
  mode: "history",
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

export default router;
