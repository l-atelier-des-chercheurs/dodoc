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
    path: "/formats/:format_slug",
    name: "Format",
    meta: {
      /* do not load full UI */
      static: true,
    },
    component: () =>
      import(/* webpackChunkName: "FormatView" */ "../views/FormatView.vue"),
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
    path: "/p/:page_slug",
    name: "Page",
    component: () =>
      import(/* webpackChunkName: "Page" */ "../views/PageView.vue"),
  },
  {
    path: "/_ui",
    name: "UI (dev only)",
    component: () =>
      import(/* webpackChunkName: "AuthorView" */ "../views/UIView.vue"),
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
