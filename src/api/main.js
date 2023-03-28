import RGApi from "./service";
import utils from "@/libs/utils";
import md5 from "js-md5";

export default {
  getPromise(params) {
    const data = defaultParams(process.env.VUE_APP_KEY_PROMISE, params);
    return RGApi.request({
      method: "post",
      url: "",
      params: { param: JSON.stringify(data) },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
  },
  postUpload(params) {
    const data = defaultParams(process.env.VUE_APP_KEY_UPLOAD, params);
    return RGApi.request({
      method: "post",
      data: { param: JSON.stringify(data) },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
  },
  postAuth(params) {
    const data = defaultParams(process.env.VUE_APP_KEY_AUTHLIST, params);
    return RGApi.request({
      method: "post",
      data: { param: JSON.stringify(data) },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
  },
  postDeclare(params) {
    const data = defaultParams(process.env.VUE_APP_KEY_DECLARE, params);
    return RGApi.request({
      method: "post",
      data: { param: JSON.stringify(data) },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
  },
  postVisit(params) {
    const data = defaultParams(process.env.VUE_APP_KEY_VISIT, params);
    return RGApi.request({
      method: "post",
      data: { param: JSON.stringify(data) },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
  },
  postSubmit(params) {
    const data = defaultParams(process.env.VUE_APP_KEY_SUBMIT, params);
    return RGApi.request({
      method: "post",
      data: { param: JSON.stringify(data) },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
  },
};

const defaultParams = (key, params = {}) => {
  return {
    from: utils.iswxorapipay()[0],
    key,
    requestTime: utils.getNowLongTime(),
    sign: md5(process.env.VUE_APP_TAG + utils.getNowLongTime()),
    ...params,
  };
};
