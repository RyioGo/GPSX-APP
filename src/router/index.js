import Vue from "vue";
import VueRouter from "vue-router";
import baseRoutes from "@/router/base";

Vue.use(VueRouter);

const routes = baseRoutes;

const router = new VueRouter({
  mode: "hash",
  base: "/" + process.env.VUE_APP_VERSION,
  routes,
});

const VueRouterPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(to) {
  return VueRouterPush.call(this, to).catch((err) => err);
};

router.beforeEach(async (to, from, next) => {
  to, from;
  next();
});

router.afterEach((to, from) => {
  to, from;
  window.scrollTo(0, 0);
});

export default router;
