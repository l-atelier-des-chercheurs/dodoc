import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Accueil",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/+:space_slug",
    name: "Espace",
    component: () => import("@/views/SpaceView.vue"),
  },
  {
    path: "/+:space_slug/:project_slug",
    name: "Projet",
    component: () => import("@/views/ProjectView.vue"),
  },
  {
    path: "/+:space_slug/:project_slug/publications/:publication_slug",
    alias: ["*/export.html"],
    name: "Publication",
    meta: {
      /* do not load full UI */
      static: true,
    },
    component: () => import("@/views/PublicationView.vue"),
  },
  {
    path: "/@",
    name: "Tous les auteurs",
    component: () => import("@/views/AuthorsView.vue"),
  },
  {
    path: "/@:author_slug",
    name: "Auteur",
    component: () => import("@/views/AuthorView.vue"),
  },
  {
    path: "/p/:page_slug",
    name: "Page",
    component: () => import("@/views/PageView.vue"),
  },
  {
    path: "/_ui",
    name: "UI (dev only)",
    component: () => import("@/views/UIView.vue"),
  },
  // {
  //   path: "/=:event_slug",
  //   name: "Événement",
  //   component: () =>
  //     import(/* webpackChunkName: "AuthorView" */ "@/views/EventView.vue"),
  // },
  {
    // route to display a single media with caption/credits and
    // with qr scan option, and to generate preview for PDF and STL server-side
    path: "/_previewmedia",
    name: "Preview media",
    meta: {
      /* do not load full UI */
      static: true,
    },
    component: () => import("@/views/PreviewMedia.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: "/",
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

export default router;
