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
