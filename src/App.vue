<script>
import RGFooter from "@/components/RGFooter/index.vue";
export default {
  name: "App",
  components: {
    RGFooter,
  },
};
</script>

<template>
  <div class="index-page">
    <router-view />
    <RGFooter />
  </div>
</template>

<style lang="less">
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
.index-page {
  background-color: #fff;
}

.danger {
  color: red !important;
}
</style>
