import VueRouter, { RouterMode } from "vue-router";
import type { RouteConfigSingleView } from "vue-router/types/router";

/** Router Configure */
const routes: RouteConfigSingleView[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomePage.vue"),
  },
  {
    path: "/carousel",
    name: "Carousel",
    component: () => import("@/views/CarouselPage.vue"),
  },
];

export function createRouter(mode: RouterMode): VueRouter {
  return new VueRouter({
    mode,
    routes,
  });
}
