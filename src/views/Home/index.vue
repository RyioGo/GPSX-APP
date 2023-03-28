<script>
//  for node_modules api
import { Component, Watch, Vue } from "vue-property-decorator";

import resList from "@/static/data/config";
import userApi from "@/api/user";
import api from "@/api/main";

import RGPicker from "@/components/RGPicker";
@Component({
  components: { RGPicker },
})
export default class HomeView extends Vue {
  banner = resList().banner;
  loading = false;
  finished = false;

  list = [];
  pageSize = 10;
  pageNum = 1;

  search = "";
  orgName = "";
  theme = "";
  people = "";
  dict = {
    orgNames: [],
    themes: [],
    peoples: [],
  };

  //  监听
  @Watch("search")
  WatchSearchKey() {
    this.handleOK();
  }
  //  监听
  @Watch("theme")
  WatchThemeKey() {
    this.handleOK();
  }
  //  监听
  @Watch("people")
  WatchPeopleKey() {
    this.handleOK();
  }
  //  监听
  @Watch("orgName")
  WatchOrgNameKey() {
    this.handleOK();
  }

  reset() {
    this.search = "";
    this.orgName = "";
    this.theme = "";
    this.people = "";
  }

  handleOK() {
    let orgName, people, theme;
    let arr = resList().list.default.filter((item) => {
      orgName = item.orgName && item.orgName.includes(this.orgName);
      people = item.people && item.people.includes(this.people);
      theme = item.theme && item.theme.includes(this.theme);
      return orgName && people && theme && item.name.includes(this.search);
    });
    this.list = arr.slice(0, this.pageSize * this.pageNum);
    return arr.length;
  }

  onLoad() {
    // 异步更新数据
    setTimeout(() => {
      let len = this.handleOK();
      this.pageNum++;

      // 加载状态结束
      this.loading = false;

      // 数据全部加载完成
      if (this.list.length >= len) {
        this.finished = true;
      }
    }, 300);
  }

  filterData() {
    let orgNames = {};
    let themes = {};
    let peoples = {};
    resList().list.default.forEach((item) => {
      if (item.orgName) {
        orgNames[item.orgName] = "";
      }
      if (item.theme) {
        item.theme.split(";").forEach((it) => {
          themes[it] = "";
        });
      }
      if (item.people) {
        item.people.split(",").forEach((it) => {
          peoples[it] = "";
        });
      }
    });
    this.dict.orgNames = Object.keys(orgNames).map((it) => {
      return { value: it, text: it };
    });
    this.dict.themes = Object.keys(themes).map((it) => {
      return { value: it, text: it };
    });
    this.dict.peoples = Object.keys(peoples).map((it) => {
      return { value: it, text: it };
    });
  }

  toDetail(item) {
    this.storage.set("so", item.people);
    this.storage.set("ip", item.ad);
    this.$router.push({
      path: "/base/detail",
      query: {
        code: item.code,
      },
    });
  }

  created() {
    this.filterData();
    userApi.getUserInfo(() => {
      api.postVisit({
        idCard: this.storage.get("idCard"),
        name: this.storage.get("name"),
        type: "HIGH_FREQUENCY_SERVICE",
        typeName: "高频服务",
      });
    });
  }
}
</script>

<template>
  <div class="page">
    <div class="page-bg">
      <img :src="banner" class="banner" />
    </div>
    <div class="page-filter">
      <van-search show-action v-model="search" placeholder="请输入搜索关键词">
        <template #action>
          <van-button
            icon="revoke"
            type="info"
            size="small"
            round
            @click="reset()"
          />
        </template>
      </van-search>
      <div class="filter">
        <RGPicker
          class="picker"
          :value.sync="orgName"
          placeholder="按机构筛选"
          :localData="dict.orgNames"
        />
        <div class="row-item">
          <RGPicker
            class="picker"
            :value.sync="theme"
            placeholder="按主题筛选"
            :localData="dict.themes"
          />
          <div style="width: 0.2051rem" />
          <RGPicker
            class="picker"
            :value.sync="people"
            placeholder="按类型筛选"
            :localData="dict.peoples"
          />
        </div>
      </div>
    </div>
    <div class="main">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell-group class="result" v-if="list.length">
          <van-cell
            is-link
            center
            v-for="(item, index) in list"
            :key="index"
            :title="index + 1 + ' .' + item.name"
            :label="item.orgName"
            @click="toDetail(item)"
          />
        </van-cell-group>
        <van-empty v-else />
      </van-list>
    </div>
  </div>
</template>

<style scoped lang="less">
.page {
  .page-bg {
    .banner {
      width: 100%;
      height: 4.1026rem;
      object-fit: cover;
    }
  }
  .page-filter {
    position: sticky;
    top: 0;
    z-index: 9;
    background-color: #fff;
    padding-bottom: 0.2051rem;
    /deep/ .van-search__action {
      line-height: 0;
    }
    .filter {
      padding: 0 0.3077rem;
      .row-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .picker {
        margin-bottom: 0.0769rem;
        overflow: hidden;
        border: 0.0256rem solid #dfe2e5;
        border-radius: 0.0769rem;
      }
    }
  }
  .main {
    margin-top: 0.0769rem;
    .result {
      margin: 0.3077rem;
      box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.08);
      border-radius: 0.2051rem;
      overflow: hidden;
    }
  }
}
</style>
