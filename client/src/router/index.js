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
    path: "/+:space_slug",
    name: "Espace",
    component: () =>
      import(/* webpackChunkName: "SpaceView" */ "../views/SpaceView.vue"),
  },
  {
    path: "/+:space_slug/:project_slug",
    name: "Projet",
    component: () =>
      import(/* webpackChunkName: "ProjectView" */ "../views/ProjectView.vue"),
  },
  {
    path: "/+:space_slug/:project_slug/publications/:publication_slug",
    name: "Publication",
    component: () =>
      import(
        /* webpackChunkName: "PublicationView" */ "../views/PublicationView.vue"
      ),
  },
  {
    path: "/@:author_slug",
    name: "Contributeur",
    component: () =>
      import(/* webpackChunkName: "AuthorView" */ "../views/AuthorView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: "/",
  routes,
});

export default router;
