import RGApi from "./service";
import utils from "@/libs/utils";
import { Notify } from "vant";
import { storage } from "@/libs/plugin";

export default {
  getUserInfo(callback) {
    const token = storage.get("token");
    if (token) return;

    const ticket = utils.GetRequest().auth_token;
    const appid = utils.GetRequest().appid;
    RGApi.request({
      method: "get",
      url: process.env.VUE_APP_API_USERURL,
      params: {
        ticket,
        appid,
      },
    }).then((res) => {
      if (res && res.succ) {
        storage.set("token", res.token);
        storage.set("name", res.data.name);
        storage.set("idCard", res.data.cardid);
        storage.set("phone", res.data.mobile);
        storage.set("sex", res.data.sex);
        storage.set("appid", appid);
        callback && callback();
      } else {
        Notify({ type: "warning", message: res.msg });
      }
    });
  },
};
