import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "../views/HomeView.vue";
import ProjectsView from "../views/ProjectsView.vue";
import ProjectView from "../views/ProjectView.vue";

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
    component: ProjectsView,
  },
  {
    path: "/projects/:slug",
    name: "projet",
    component: ProjectView,
    // component: () =>
    //   import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
