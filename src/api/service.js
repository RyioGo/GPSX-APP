import HttpClient from "@/libs/axios";
import { Notify } from "vant";

import { storage } from "@/libs/plugin";
storage;
const RGApi = new HttpClient(
  {
    baseURL: process.env.VUE_APP_API_URL,
    timeout: 1000 * 24,
  },
  {
    UseRequest,
    UseResponse,
    UseError,
  }
);

//  请求拦截器
function UseRequest(config) {
  config.headers = Object.assign(
    {
      //token: storage.get("token"),
    },
    config.headers
  );

  return config;
}
//  响应拦截器
function UseResponse(response) {
  console.log(response);
  if (response.status == 200) {
    return response.data;
  } else {
    Notify({ type: "warning", message: response.message });
  }
}
//  异常拦截器
function UseError(error) {
  Notify({ type: "danger", message: "已拦截本次异常请求！" });
  return Promise.reject(error);
}

export default RGApi;
