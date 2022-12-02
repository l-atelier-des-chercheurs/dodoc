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
    name: "projet",
    component: () =>
      import(/* webpackChunkName: "ProjectView" */ "../views/ProjectView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: "/",
  routes,
});

export default router;
