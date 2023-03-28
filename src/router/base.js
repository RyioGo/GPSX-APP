const baseRoutes = [
  {
    path: "/base/index",
    name: "index",
    component: () =>
      import(/* webpackChunkName: "home" */ "@/views/Home/index.vue"),
  },
  {
    path: "/base/detail",
    name: "detail",
    component: () =>
      import(/* webpackChunkName: "detail" */ "@/views/Detail/index.vue"),
  },
  {
    path: "/base/apply",
    name: "apply",
    component: () =>
      import(/* webpackChunkName: "apply" */ "@/views/Apply/index.vue"),
  },
  { path: "*", redirect: "/base/index" },
];

export default baseRoutes;
