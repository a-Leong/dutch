import { createRouter, createWebHistory } from "vue-router";
import { auth } from "@/firebase-config";

export const ERROR_PAGE = "error";
export const LOGIN_PAGE = "login";
export const PLAY_PAGE = "play";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: LOGIN_PAGE,
    component: () => import("@/views/LoginPage.vue"),
  },
  {
    path: "/error",
    name: ERROR_PAGE,
    component: () => import("@/views/ErrorPage.vue"),
  },
  {
    path: "/play",
    name: PLAY_PAGE,
    component: () => import("@/views/PlayPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:catchAll(.*)*",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const currentUser = auth.currentUser;
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !currentUser) {
    next({ name: LOGIN_PAGE });
  } else if (currentUser && to.name === LOGIN_PAGE) {
    next({ name: PLAY_PAGE });
  } else {
    next();
  }
});

export default router;
