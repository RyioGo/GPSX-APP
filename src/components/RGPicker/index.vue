<script>
import { Component, Prop, PropSync, Vue } from "vue-property-decorator";

@Component
export default class RGPicker extends Vue {
  //  字典
  @Prop({ type: Array, required: true }) localData;
  //  描述
  @Prop({ type: String, default: "请输入" }) placeholder;
  //  名称
  @Prop({ type: String, default: "" }) label;
  //  规则
  @Prop({ type: Array, default: () => [] }) rules;
  //  双向绑定
  @PropSync("value", { required: true })
  data;

  showPicker = false;
  key = null;

  onConfirm(val) {
    this.key = val.text;
    this.data = val.value;
    this.showPicker = false;
  }

  get labelData() {
    // if (this.key && this.key.length) {
    //   return this.key;
    // }
    let str = "";
    this.localData.forEach((item) => {
      if (item.value == this.data) {
        str = item.text;
      }
    });
    return str;
  }
}
</script>

<template>
  <div class="rg-picker">
    <van-field
      readonly
      clickable
      @click="showPicker = true"
      :label="label"
      :value="labelData"
      :placeholder="placeholder"
      :required="rules.length > 0"
      :rules="rules"
    />
    <van-popup v-model="showPicker" position="bottom">
      <van-picker
        show-toolbar
        :columns="localData"
        @confirm="onConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped lang="less"></style>
