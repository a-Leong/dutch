import { createRouter, createWebHistory } from "vue-router";
import { auth } from "@/firebase-config";

export const LOGIN_PATH = "/login";
export const PLAY_PATH = "/play";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: LOGIN_PATH,
    name: "LoginPage",
    component: () => import("@/views/LoginPage.vue"),
  },
  {
    path: PLAY_PATH,
    name: "PlayPage",
    component: () => import("@/views/PlayPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:catchAll(.*)*",
    redirect: LOGIN_PATH,
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
    next(LOGIN_PATH);
  } else if (currentUser && to.path === LOGIN_PATH) {
    next(PLAY_PATH);
  } else {
    next();
  }
});

export default router;
