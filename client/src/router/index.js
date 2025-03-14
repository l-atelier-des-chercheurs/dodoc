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
    path: "/chutier",
    name: "Chutier",
    component: () =>
      import(/* webpackChunkName: "ChutierView" */ "../views/ChutierView.vue"),
  },
  {
    path: "/archives",
    name: "Archives",
    component: () =>
      import(
        /* webpackChunkName: "ArchivesView" */ "../views/ArchivesView.vue"
      ),
    children: [
      {
        path: ":folder_slug",
        name: "Archive",
      },
    ],
  },
  {
    path: "/collections",
    name: "Collections",
    component: () =>
      import(
        /* webpackChunkName: "CollectionsView" */ "../views/CollectionsView.vue"
      ),
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
