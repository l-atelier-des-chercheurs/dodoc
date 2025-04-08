import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Accueil",
    component: () =>
      import(/* webpackChunkName: "AccueilView" */ "../views/Accueil.vue"),
  },
  {
    path: "/contribute",
    name: "Contribuer",
    component: () =>
      import(
        /* webpackChunkName: "ContributeView" */ "../views/ContributeView.vue"
      ),
  },
  {
    path: "/corpus",
    name: "Corpus",
    component: () =>
      import(/* webpackChunkName: "CorpusView" */ "../views/CorpusView.vue"),
  },
  {
    path: "/collections/:collection_slug",
    name: "Collections",
    meta: {
      /* do not load full UI */
      static: true,
    },
    component: () =>
      import(
        /* webpackChunkName: "CollectionView" */ "../views/CollectionView.vue"
      ),
  },
  {
    path: "/@",
    name: "Tous les auteurs",
    component: () => import("@/views/AuthorsView.vue"),
  },
  {
    path: "/@:author_slug",
    name: "Contributeur",
    component: () =>
      import(/* webpackChunkName: "AuthorView" */ "@/views/AuthorView.vue"),
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
    // internal route to generate preview for PDF and STL
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
});

export default router;
