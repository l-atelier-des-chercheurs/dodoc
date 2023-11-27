import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Accueil",
    component: () =>
      import(/* webpackChunkName: "LumaView" */ "../views/LumaView.vue"),
  },
  {
    path: "/@",
    name: "Tous les auteurs",
    component: () =>
      import(/* webpackChunkName: "AuthorsView" */ "../views/AuthorsView.vue"),
  },
  {
    path: "/@:author_slug",
    name: "Contributeur",
    component: () =>
      import(/* webpackChunkName: "AuthorView" */ "../views/AuthorView.vue"),
  },
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
