const data = {
  高频事项: {
    list: require("./gpsx"),
    banner: require("@/static/image/gpsx-banner.svg"),
  },
  在线办理: {
    list: require("./zxbl"),
    banner: require("@/static/image/zxbl-banner.svg"),
  },
};

export default () => {
  return data[process.env.VUE_APP_NAME];
};
