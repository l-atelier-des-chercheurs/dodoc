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
    path: "/share",
    name: "Partager",
    component: () =>
      import(/* webpackChunkName: "ShareView" */ "../views/ShareView.vue"),
  },
  {
    path: "/share/:folder_slug",
    name: "Corpus",
    component: () =>
      import(/* webpackChunkName: "CorpusView" */ "../views/CorpusView.vue"),
  },
  {
    path: "/documents",
    name: "Documents",
    component: () =>
      import(
        /* webpackChunkName: "DocumentsView" */ "../views/DocumentsView.vue"
      ),
  },
  {
    path: "/documents/:document_slug",
    name: "Document",
    component: () =>
      import(
        /* webpackChunkName: "DocumentView" */ "../views/DocumentView.vue"
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
    return new Promise((resolve, reject) => {
      // only if changing page and not just query or hash
      if (to.path !== from.path) {
        setTimeout(() => {
          if (savedPosition) {
            return resolve(savedPosition);
          } else {
            return resolve({ x: 0, y: 0 });
          }
        }, 150);
      }
    });
  },
});

export default router;
