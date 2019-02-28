<template>
  <div class="login-container">
    <flexbox orient="vertical" justify="center" align="center">
      <img class="login-avator" src="@/assets/logo.png" />
      <flexbox-item>
        <group class="login-group">
          <span>登录/注册</span>
          <x-input
            :show-clear="false"
            title="姓名"
            v-model="username"
            placeholder="请输入姓名"
          ></x-input>
          <x-input
            :show-clear="false"
            title="密码"
            type="password"
            v-model="password"
            placeholder="请输入密码"
          ></x-input>
          <div class="login-button">
            <x-button @click.native="handleLogin">登录</x-button>
            <x-button @click.native="handleRegister">注册</x-button>
          </div>
        </group>
      </flexbox-item>
    </flexbox>
    <toast
      v-model="showToast"
      type="text"
      :time="2000"
      :text="errMsg"
      position="middle"
    ></toast>
  </div>
</template>

<script>
import { Flexbox, FlexboxItem, Group, XInput, XButton, Toast } from "vux";
export default {
  components: {
    Flexbox,
    FlexboxItem,
    Group,
    XInput,
    XButton,
    Toast
  },
  data() {
    return {
      username: "",
      password: "",
      showToast: false, // 是否显示 toast
      errMsg: "" // 出错提示信息
    };
  },
  mounted() {
    //注册
    /* eslint-disable */
    socket.on("register_result", (code, msg) => {
      if (code){
        this.errMsg = "注册失败:" + msg;
        this.showToast = true;
      } else {
        this.errMsg = "注册成功";
        this.showToast = true;
      }
    });
    // 登录
    /* eslint-disable */
    socket.on("login_result", (code, msg) => {
      if (code) {
        this.errMsg = "登录失败:" + msg;
        this.showToast = true;
      } else {
        // 登录成功
        this.errMsg = "登录成功";
        this.showToast = true;
        this.$router.push({name:"index", params: { username: this.username }});
        this.username = '';
      }
    })
  },
  methods: {
    handleRegister() {
      // 验证数据
      if (!this.isValidate())
        return;
      // 向 socket 发送注册信息
      /* eslint-disable */
      socket.emit("register", this.username, this.password);
    },
    handleLogin() {
      // 验证数据
      if (!this.isValidate())
        return;
      // 向 socket 发送登录信息
      /* eslint-disable */
      socket.emit("login", this.username, this.password);
    },
    isValidate() {
      // 验证数据
      if (this.username === "") {
        this.errMsg = "请输入用户名";
        this.showToast = true;
        return false;
      }
      if (this.password === "") {
        this.errMsg = "请输入密码";
        this.showToast = true;
        return false;
      }
      return true;
    }
  }
};
</script>

<style lang="less">
.login-container {
  width: 100%;
  height: 100%;
  padding-top: 30%;
  display: flex;
  justify-content: center;
  background-color: aquamarine;
  .login-avator {
    width: 8rem;
  }
  .login-group {
    display: flex;
    justify-content: center;
    .weui-cells {
      border-radius: 8px;
      box-shadow: 0px 2px 7px 0px rgba(68, 98, 196, 0.1);
      padding: 2px;
      span {
        display: flex;
        justify-content: center;
        color: #666;
        font-weight: 550;
        font-size: 1.5rem;
      }
    }
    .login-button {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin: 8px;
      button {
        margin: 0.5rem;
      }
    }
  }
}
</style>
