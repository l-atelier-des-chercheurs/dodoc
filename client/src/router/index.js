import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "../views/HomeView.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Accueil",
    component: HomeView,
  },
  {
    path: "/projects",
    name: "Projets",
    component: () =>
      import(/* webpackChunkName: "ProjectView" */ "../views/ProjectsView.vue"),
  },
  {
    path: "/projects/:slug",
    name: "projet",
    component: () =>
      import(/* webpackChunkName: "ProjectView" */ "../views/ProjectView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: "/",
  routes,
});

export default router;
