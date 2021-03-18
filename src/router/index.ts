import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Accueil from "@/views/Accueil.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Accueil",
    component: Accueil
  },
  {
    path: "/compte",
    name: "Compte",
    component: () => import("@/views/Compte.vue")
  },
  {
    path: "/projets",
    name: "Projets",
    component: () => import("@/views/Projets/Projets.vue")
  },
  {
    path: "/bd",
    name: "Bases de données",
    component: () => import("@/views/BD/BD.vue")
  },
  {
    path: "/bd/créer",
    // component: () => import("@/views/CréerBD.vue")
  },
  {
    path: "/bd/visualiser/:id",
    component: () => import("@/views/BD/VisBD.vue")
  },
  {
    path: "/tableau/visualiser/:id",
    component: () => import("@/views/BD/VisTableau.vue")
  },
  {
    path: "/recherche",
    name: "Recherche",
    component: () => import("@/views/Recherche.vue")
  },
  {
    path: "/favoris",
    name: "Favoris",
    component: () => import("@/views/Favoris.vue")
  },
  {
    path: "/automation",
    name: "Automation",
    component: () => import("@/views/Automation.vue")
  },{
    path: "/signalements",
    name: "Signalements",
    component: () => import("@/views/Signalements.vue")
  },
  { path: "*", redirect: "/" }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
