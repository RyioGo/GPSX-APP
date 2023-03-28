<script>
//  for node_modules api
import { Component, Vue } from "vue-property-decorator";

//  for you api
import api from "@/api/main";
import utils from "@/libs/utils";

//  for you components
import RGPicker from "@/components/RGPicker";

import imgDemo from "@/static/image/demo.png";

@Component({
  components: { RGPicker },
})
export default class ApplyView extends Vue {
  loading = false;
  showAuth = false;
  statusCard = "";
  keyCard = 0;
  authCards = [];
  userType = this.storage.get("workType");
  // 业务申报数据
  datas = {
    ReceiveNum: "",
    // sp 固定值
    State: "sp",
    ItemId: "", //this.storage.get("info").id,
    ItemCode: this.storage.get("info").code,
    ItemName: this.storage.get("info").name,
    OrgCode: this.storage.get("info").org_CODE,
    OrgName: this.storage.get("info").org_NAME,
    // 1 自然人 2 项目 3 法人
    ObjectType: this.storage.get("workType") == "1" ? 1 : 3,
    applyFrom: utils.iswxorapipay()[1],
    metail: [],
    info: {},
    servicelist: {
      ApplicantID: this.storage.get("idCard"),
      ApplicantName: this.storage.get("name"),
      ApplicantAddress: "",
      ApplicantMobile: this.storage.get("phone"),
      GetType: 0,
      SendType: 0,
    },
  };
  pon = {
    identityType: "10",
    idcardNo: this.storage.get("idCard"),
    name: this.storage.get("name"),
    linkPhone: this.storage.get("phone"),
    linkAddress: "",
    sex: this.storage.get("sex") === "1" ? "男" : "女",
  };
  enr = {
    orgName: "",
    orgCode: "",
    legalPerson: "",
    certificateNo: "",
    registerAddress: "",
    mailingAddress: "",
    postalCode: "",
    linkMan: this.storage.get("name"),
    contactPhone: this.storage.get("phone"),
  };

  // 材料
  metail = this.storage.get("material").map((item) => {
    item.data = [];
    return item;
  });

  get newName() {
    return utils.getName(this.storage.get("name") || "");
  }
  get newIdCard() {
    return utils.getIdCord(this.storage.get("idCard") || "");
  }
  get newTel() {
    return utils.getPhone(this.storage.get("phone") || "");
  }

  async getAuthCard() {
    this.statusCard = "证照加载中";
    const res = await api.postAuth({
      id_code: this.storage.get("idCard"),
      cas_type: "1",
      code: "123456789",
    });
    if (res && res.code == 0) {
      this.authCards = res.data.data.map((item, i) => {
        let obj = {
          more: { ...item },
          name: item.name,
          subname: item.issue_org_name,
          auth_codes: res.data.auth_codes[i],
        };
        return obj;
      });
      this.statusCard = this.authCards.length ? "证照待上传" : "无省内证照";
    } else {
      this.statusCard = "证照获取失败";
    }
  }

  afterRead(fileObj, { name }) {
    fileObj.status = "uploading";
    fileObj.message = "上传中...";
    utils.blobToBase64(fileObj.file, (base64) => {
      this.dealImage(base64, 1400, async (newBase64) => {
        try {
          const res = await api.postUpload({
            base64: newBase64,
            fileName: this.metail[name].name + ".jpg",
          });
          res;
          if (res && res.code == 0) {
            fileObj.status = "done";
            fileObj.message = "上传完成";
            fileObj.data = {
              FILE_NAME: res.data.fileName,
              FILE_PATH: res.data.filePath,
              DOCUMENT_ID: this.metail[name].code,
              DOCUMENT_NAME: this.metail[name].name,
              DOCUMENT_CODE: this.metail[name].code,
              //  图片 1  电子证照 3
              TYPE: "1",
            };
          } else {
            fileObj.status = "failed";
            fileObj.message = "上传失败";
          }
        } catch (error) {
          fileObj.status = "failed";
          fileObj.message = "上传失败";
        }
      });
    });
  }

  openCards(key) {
    this.keyCard = key;
    this.showAuth = true;
  }
  setAuthFile(data) {
    let metail = this.metail[this.keyCard];
    let result = {
      data: {
        FILE_NAME: metail.name,
        FILE_PATH: data.auth_codes,
        DOCUMENT_ID: metail.code,
        DOCUMENT_NAME: metail.name,
        DOCUMENT_CODE: metail.code,
        FILE_AUTH_CODE: data.auth_codes,
        TYPE: "3",
      },
      content: imgDemo,
      file: utils.dataURLToFile(imgDemo, "电子证照"),
      message: "上传完成",
      status: "done",
    };
    metail.data.push(result);
    this.showAuth = false;
  }

  async onSubmit() {
    let metail = [];
    try {
      //  校验材料清单
      this.metail.forEach((item) => {
        if (item.data && item.data.length) {
          metail = metail.concat(item.data.map((item) => item.data));
        } else {
          throw new Error(item.name + "材料获取失败");
        }
      });
      this.loading = true;
      this.datas.metail = metail;
      this.datas.info = this.userType == "1" ? this.pon : this.enr;
      //  开始提交
      const res = await api.postDeclare({
        postdata: this.datas,
      });
      if (res && res.code == 0) {
        await api.postSubmit({
          name: this.datas.ItemName,
          userName: this.storage.get("name"),
          idCard: this.storage.get("idCard"),
          organization: this.datas.OrgName,
        });
        let msg = `本次申报编号：\n${res.data.receiveNum} `; //\n本次申报密码：\n${res.data.password}
        this.$dialog
          .alert({
            title: "线上申报成功！",
            message: msg,
            theme: "round-button",
          })
          .then(() => {
            // 签章成功后弹窗提示
            this.$copyText(msg).then(() => {
              this.$notify({ type: "success", message: "复制成功！" });
            });
          });
      } else {
        this.$notify({
          type: "warning",
          message: res.msg || res.reason || "提交失败",
        });
      }
      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.$notify({
        type: "warning",
        message: error.message,
      });
    }
  }

  created() {
    this.getAuthCard();
  }

  //压缩方法
  dealImage(base64, w, callback) {
    var newImage = new Image();
    var quality = 0.6; //压缩系数0-1之间
    newImage.src = base64;
    newImage.setAttribute("crossOrigin", "Anonymous"); //url为外域时需要
    var imgWidth, imgHeight;
    newImage.onload = function () {
      imgWidth = this.width;
      imgHeight = this.height;
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      if (Math.max(imgWidth, imgHeight) > w) {
        if (imgWidth > imgHeight) {
          canvas.width = w;
          canvas.height = (w * imgHeight) / imgWidth;
        } else {
          canvas.height = w;
          canvas.width = (w * imgWidth) / imgHeight;
        }
      } else {
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        quality = 0.6;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
      var base64 = canvas.toDataURL("image/jpeg", quality); //压缩语句

      callback(base64); //必须通过回调函数返回，否则无法及时拿到该值
    };
  }
}
</script>

<template>
  <div class="page" v-loading="loading">
    <van-form class="page-form" @submit="onSubmit">
      <van-cell-group v-if="userType == '1'" class="page-form-group">
        <van-cell title="基本信息（个人）" title-class="tc" />
        <van-field
          v-model="newName"
          readonly
          name="name"
          label="申报人员"
          required
          :rules="[{ required: true, message: '请填写申报人员' }]"
        />
        <van-field
          value="身份证"
          readonly
          name="identityType"
          label="证件类型"
          required
          :rules="[{ required: true, message: '请填写证件类型' }]"
        />
        <van-field
          v-model="newIdCard"
          readonly
          name="idcardNo"
          label="证件号码"
          required
          :rules="[{ required: true, message: '请填写证件号码' }]"
        />
        <van-field
          v-model="newTel"
          readonly
          name="linkPhone"
          label="联系电话"
          required
          :rules="[{ required: true, message: '请填写联系电话' }]"
        />
        <van-field
          v-model="pon.linkAddress"
          name="linkAddress"
          label="联系地址"
          rows="1"
          autosize
          type="textarea"
          required
          placeholder="请填写联系地址"
          :rules="[{ required: true, message: '请填写联系地址' }]"
        />
      </van-cell-group>
      <van-cell-group v-if="userType == '0'" class="page-form-group">
        <van-cell title="基本信息（法人）" title-class="tc" />
        <van-field
          v-model="newName"
          readonly
          name="name"
          label="申报人员"
          required
          :rules="[{ required: true, message: '请填写申报人员' }]"
        />
        <van-field
          v-model="newTel"
          readonly
          name="contactPhone"
          label="联系电话"
          required
          :rules="[{ required: true, message: '请填写联系电话' }]"
        />
        <van-field
          v-model="enr.legalPerson"
          name="legalPerson"
          label="法定代表人"
          required
          placeholder="请填写法定代表人"
          :rules="[{ required: true, message: '请填写法定代表人' }]"
        />
        <van-field
          v-model="enr.certificateNo"
          name="certificateNo"
          label="法人证件号"
          required
          placeholder="请填写法人证件号"
          :rules="[{ required: true, message: '请填写法人证件号' }]"
        />
        <van-field
          v-model="enr.orgName"
          name="orgName"
          label="组织机构名称"
          required
          placeholder="请填写组织机构名称"
          :rules="[{ required: true, message: '请填写组织机构名称' }]"
        />
        <van-field
          v-model="enr.orgCode"
          name="orgCode"
          label="组织机构代码"
          required
          placeholder="请填写组织机构代码"
          :rules="[{ required: true, message: '请填写组织机构代码' }]"
        />
        <van-field
          v-model="enr.registerAddress"
          name="registerAddress"
          label="单位注册地址"
          rows="1"
          autosize
          type="textarea"
          placeholder="请填写单位注册地址"
        />
        <van-field
          v-model="enr.mailingAddress"
          name="mailingAddress"
          label="单位通讯地址"
          rows="1"
          autosize
          type="textarea"
          placeholder="请填写单位通讯地址"
        />
      </van-cell-group>

      <van-cell-group class="page-form-group">
        <van-cell title="办理材料" title-class="tc" />
        <van-cell
          v-for="(item, index) in metail"
          :key="index"
          :title="item.name"
        >
          <template #icon>
            <span style="color: red">*</span>
          </template>
          <template #label>
            <div class="metail">
              <van-uploader
                :max-count="5"
                :name="index"
                v-model="item.data"
                :after-read="afterRead"
              />
            </div>
            <van-button
              type="info"
              size="small"
              native-type="button"
              :disabled="authCards.length == 0 || item.data.length >= 5"
              @click="openCards(index)"
            >
              {{ statusCard }}
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="info" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
    <van-action-sheet
      v-model="showAuth"
      :actions="authCards"
      cancel-text="取消"
      :description="newName + '的证照清单'"
      @select="setAuthFile"
      safe-area-inset-bottom
    />
  </div>
</template>

<style scoped lang="less">
.page {
  min-height: 100vh;
  .page-form {
    margin: 0.2051rem 0.3077rem 0;
    .page-form-group {
      padding: 0.2051rem;
      border-radius: 0.2051rem;
      overflow: hidden;
      margin-top: 0.2051rem;
      box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.08);
      .tc {
        color: #4484f2;
        font-weight: 700;
      }
    }
  }
  .auth-card {
    .group-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px 0px 15px;
      border-bottom: 0.3px solid #dcdcdc;

      p {
        height: 36px;
        line-height: 36px;
        font-size: 18px;
        letter-spacing: 2px;
        padding: 8px;

        &:last-child {
          color: #007afe;
        }
      }
    }

    .auth {
      max-height: 60vh;
      overflow: hidden;
      overflow-y: scroll;

      .uni-card {
        position: relative;

        .select {
          position: absolute;
          width: 48px;
          height: 48px;
          right: 0;
          bottom: 0;
          z-index: 9;
        }
      }
    }
  }
}
</style>
