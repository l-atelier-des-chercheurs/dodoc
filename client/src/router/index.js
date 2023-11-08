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
    path: "/@",
    name: "Tous les auteurs",
    component: () =>
      import(/* webpackChunkName: "AuthorsView" */ "../views/AuthorsView.vue"),
  },
  {
    path: "/@:author_slug",
    name: "Auteur",
    component: () =>
      import(/* webpackChunkName: "AuthorView" */ "../views/AuthorView.vue"),
  },
  // {
  //   path: "/=:event_slug",
  //   name: "Événement",
  //   component: () =>
  //     import(/* webpackChunkName: "AuthorView" */ "../views/EventView.vue"),
  // },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () =>
      import(/* webpackChunkName: "AuthorView" */ "../views/NotFound.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: "/",
  routes,
});

export default router;
