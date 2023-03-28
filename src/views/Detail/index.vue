<script>
//  for node_modules api
import { Component, Vue } from "vue-property-decorator";

//  for you api
import api from "@/api/main";
//  for you ts

//  for you components
import resList from "@/static/data/config";

@Component
export default class DetailView extends Vue {
  banner = resList().banner;
  loading = true;
  network = false;
  detail = {};
  tabs = ["业务信息", "受理条件", "咨询/监督", "法律依据", "相关材料"];
  active = 0;

  //办事对象
  getAssort(val) {
    var str = "";
    switch (val) {
      case "1":
        str = "企业法人";
        break;
      case "2":
        str = "其他组织";
        break;
      case "3":
        str = "事业法人";
        break;
      case "4":
        str = "社会组织法人";
        break;
      case "5":
        str = "非法人企业";
        break;
      case "6":
        str = "行政机关";
        break;
      case "7":
        str = "营利法人";
        break;
      case "8":
        str = "非营利法人";
        break;
      case "9":
        str = "非法人组织";
        break;
      case "10":
        str = "特别法人";
        break;
      default:
        str = "自然人";
        break;
    }
    return str;
  }
  //  方法
  naviTo() {
    const ip = this.storage.get("ip");
    if (!ip) {
      this.$notify({
        type: "warning",
        message: "暂未提供位置导航！",
      });
      return;
    }
    window.open(ip);
  }
  tell(phoneNumber) {
    if (!phoneNumber) return;
    window.location.href = "tel:" + phoneNumber;
  }

  async getBusinessDetail() {
    this.loading = true;
    const res = await api.getPromise({ itemCode: this.$route.query.code });
    if (res && res.code == 0) {
      this.network = true;
      let consult = [];
      res.data.consult.forEach((item) => {
        if (item.type == 0) {
          consult[0] = item;
        } else {
          consult[1] = item;
        }
      });
      res.data.consult = consult;
      this.detail = res.data;
      this.detail["so"] = this.storage.get("so");
    } else {
      this.$notify({
        type: "warning",
        message: res.msg || res.reason || "未查询到结果",
      });
    }
    this.loading = false;
  }

  toSubmit() {
    this.$dialog
      .alert({
        title: "办理方式",
        theme: "round-button",
        showCancelButton: this.detail.so.includes("自然人"),
        showConfirmButton: this.detail.so.split(",").length > 1,
        confirmButtonText: "法人办件",
        confirmButtonColor: "#1989fa",
        cancelButtonText: "个人办件",
        cancelButtonColor: "#1989fa",
      })
      .then(() => {
        //法人办件
        this.storage.set("workType", "0");
        to();
      })
      .catch(() => {
        //个人办件
        this.storage.set("workType", "1");
        to();
      });
    const to = () => {
      this.storage.set("info", this.detail.info[0]);
      this.storage.set("material", this.detail.material);
      this.$router.push({
        path: "/base/apply",
      });
    };
  }

  created() {
    this.getBusinessDetail();
  }
}
</script>

<template>
  <div class="page" v-loading="loading">
    <div class="page-bg">
      <img :src="banner" class="banner" />
      <div class="desc">
        <p>
          {{ detail?.charge ? "不需要收费" : "存在收费内容" }}
        </p>
        <p>不支持网络支付</p>
        <p>物流快递</p>
      </div>
    </div>
    <template v-if="network">
      <div class="page-utils" v-if="detail.consult">
        <van-cell-group inset>
          <van-cell
            icon="phone-o"
            @click="tell(detail.consult[0].phone_NUMBER)"
            :title="'咨询：' + detail.consult[0].phone_NUMBER || '暂未提供'"
          />
          <van-cell
            icon="phone-o"
            @click="tell(detail.consult[1].phone_NUMBER)"
            :title="'监督：' + detail.consult[1].phone_NUMBER || '暂未提供'"
          />
          <van-cell
            icon="location-o"
            @click="naviTo()"
            :title="'位置：' + detail.info[0].org_NAME"
          />
        </van-cell-group>
      </div>
      <div class="page-tabs">
        <van-tabs v-model="active" color="#4484f2" title-active-color="#4484f2">
          <van-tab v-for="(item, index) in tabs" :title="item" :key="index" />
        </van-tabs>
      </div>
      <div class="page-main" v-if="detail.info">
        <div v-show="active == 0">
          <van-cell title="事项名称" :label="detail.info[0].name" />
          <van-cell title="事项编码" :label="detail.info[0].code" />
          <van-cell title="申报对象" :label="detail.so" />
          <van-cell title="相关机构" :label="detail.info[0].org_NAME" />
          <van-cell
            title="法定时限"
            :label="
              detail.info[0].law_TIME > 0
                ? `受理后${detail.info[0].law_TIME}个工作日`
                : '立即办理'
            "
          />
          <van-cell
            title="承若时限"
            :label="
              detail.info[0].agree_TIME > 0
                ? `受理后${detail.info[0].agree_TIME}个工作日`
                : '立即办理'
            "
          />
          <van-cell
            title="收费标准及依据"
            :label="detail.charge.length ? '包含收费' : '不收费'"
          />
          <template v-if="detail.charge.length">
            <van-cell
              v-for="(item, index) in detail.charge"
              :key="index"
              :title="item.name"
            >
              <template #label>
                <van-cell title="" :label="`收费标准：${item.standard}`" />
                <van-cell title="" :label="`收费依据：${item.basis}`" />
              </template>
            </van-cell>
          </template>
        </div>
        <div v-show="active == 1">
          <template v-if="detail.condition.length">
            <van-cell
              v-for="(item, index) in detail.condition"
              :key="index"
              title=""
              :label="item.name"
            />
          </template>
        </div>
        <div v-show="active == 2">
          <template v-if="detail.consult.length">
            <div v-for="(item, index) in detail.consult" :key="index">
              <van-cell
                :title="item.type == 0 ? '咨询窗口' : '监督窗口'"
                :label="item.window_NAME"
              />
              <van-cell title="联系电话" :label="item.phone_NUMBER" />
              <van-cell title="投诉电话" :label="item.t_PHONE_NUMBER" />
              <van-cell title="窗口地址" :label="item.window_ADDRESS" />
              <van-cell title="工作时间" :label="item.window_TIME"> </van-cell>
              <br />
            </div>
          </template>
        </div>
        <div v-show="active == 3">
          <div v-for="(item, index) in detail.law" :key="index">
            <van-cell title="依据名称" :label="item.name" />
            <van-cell title="依据编号" :label="item.law_NUMBER" />
            <van-cell title="依据内容" :label="item.content" />
          </div>
        </div>
        <div v-show="active == 4">
          <van-cell
            v-for="(item, index) in detail.material"
            :key="index"
            :title="item.name"
            :label="item.accept_STANDARD"
          />
        </div>
      </div>
      <div class="page-btn">
        <van-button type="info" block @click="toSubmit()">
          已阅，开始申报
        </van-button>
      </div>
    </template>
    <van-empty v-else image="network" description="加载数据中" />
  </div>
</template>

<style scoped lang="less">
.page {
  min-height: 100vh;
  .page-bg {
    position: relative;
    .banner {
      width: 100%;
      height: 4.1026rem;
      object-fit: cover;
    }
    .desc {
      position: absolute;
      bottom: 0.8205rem;
      left: 0.3077rem;
      color: snow;
      display: flex;
      p {
        margin-right: 0.1538rem;
        font-size: 0.359rem;
      }
    }
  }
  .page-utils {
    border-radius: 0.2051rem;
    overflow: hidden;
    margin: 0.3077rem;
    box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.08);
  }
  .page-tabs {
    margin: 0.3077rem;
  }
  .page-main {
    padding: 0.2051rem;
    border-radius: 0.2051rem;
    overflow: hidden;
    margin: 0.3077rem;
    box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.08);
  }
  .page-btn {
    margin: 0.3077rem;
  }
  /deep/ .van-cell__label {
    font-size: 0.359rem;
    line-height: 2;
  }
}
</style>
