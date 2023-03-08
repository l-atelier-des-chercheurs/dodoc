import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Accueil",
    component: () =>
      import(/* webpackChunkName: "HomeView" */ "../views/HomeView.vue"),
  },
  {
    path: "/projects",
    name: "Projets",
    component: () =>
      import(
        /* webpackChunkName: "ProjectsView" */ "../views/ProjectsView.vue"
      ),
  },
  {
    path: "/projects/:slug",
    name: "Projet",
    component: () =>
      import(/* webpackChunkName: "ProjectView" */ "../views/ProjectView.vue"),
  },
  {
    path: "/projects/:project_slug/publications/:publication_slug",
    name: "Publication",
    component: () =>
      import(
        /* webpackChunkName: "PublicationView" */ "../views/PublicationView.vue"
      ),
  },
];

const router = new VueRouter({
  mode: "history",
  base: "/",
  routes,
});

export default router;
