<template>
  <div class="home">
    <x-header
      :left-options="{ backText: '退出', preventGoBack: true }"
      @on-click-back="$router.push('/login')"
      >聊天室
    </x-header>
    <div class="home-body">
      <div v-for="(message, index) of messages" :key="index" :class="{ active: message.isActive }" class="home-body-item">
        <img class="home-body-avator" src="../assets/logo.png" />
        <div class="home-body-content">
          <span class="username">{{ message.username }}</span>
          <span>
            {{ message.context }}
          </span>
        </div>
      </div>
    </div>
    <div class="home-bottom">
      <div class="home-bottom-container">
        <x-input
          :show-clear="false"
          required
          placeholder="请输入发送消息"
          v-model="context"
        ></x-input>
        <x-button type="primary" mini @click.native="handleSend">发送</x-button>
      </div>
    </div>
    <toast
      v-model="showToast"
      type="text"
      :time="1000"
      :text="errMsg"
      position="middle"
    ></toast>
  </div>
</template>

<script>
import { XHeader, XInput, XButton, Toast } from "vux";
export default {
  name: "home",
  components: {
    XHeader,
    XInput,
    XButton,
    Toast
  },
  data() {
    return {
      context: "", // 记录发送的消息内容
      showToast: false, // 是否显示 toast
      errMsg: "", // 出错提示信息
      messages: [], // 储存消息内容
      username: '' // 保存当前登录的用户名
    };
  },
  mounted() {
    // 接收路由传递过来的参数，判断是否登录
    this.username = this.$route.params.username;
    if(this.username === undefined) {
      // 如果当前没有登录，则跳转到登录界面
      this.$router.push('login');
    }
    socket.on("msg_result", (code, msg) => {
      if (code) {
        this.errMsg = "消息发送失败: " + msg;
        this.showToast = true;
      } else {
        // 发送消息成功处理
        var data = {
          context: this.context,
          username: this.username,
          isActive: true
        };
        this.messages.push(data);
        this.context = '';
      }
    });
    // 接收发过来的消息
    socket.on("msg", (name, context) => {
      var data = {
        username: name,
        context: context,
        isActive: false
      };
      this.messages.push(data);
    })
  },
  methods: {
    handleSend() {
      // 进行验证
      // 判断是否登录
      if(this.username === '') {
        // 如果当前没有登录，则跳转到登录界面
        this.errMsg = "请先登录!";
        this.showToast = true;
        this.$router.push('/login');
      }
      if (this.context === "") {
        this.errMsg = "请输入发送内容";
        this.showToast = true;
        return;
      }
      // 发送消息
      socket.emit("msg_send", this.context);
    }
  }
};
</script>

<style lang="less">
.home {
  position: relative;
  height: 100%;
  .home-body {
    position: absolute;
    bottom: 3rem;
    overflow-y: scroll;
    top: 3rem;
    -webkit-overflow-scrolling: touch;
    height: auto;
    width: 100%;
    .home-body-item {
      display: flex;
      flex-direction: row;
      padding: 0.5rem;
      .home-body-avator {
        width: 50px;
        height: 50px;
        box-shadow: 0px 2px 6px 1px #ccc;
        border-radius: 5px;
        margin-top: 0.5rem;
      }
      .home-body-content {
        display: flex;
        flex-direction: column;
        margin: 0 0.5rem 0.5rem 0.5rem;
        .username {
          color: #999;
          font-weight: 500;
          margin-bottom: 4px;
        }
      }
    }
    .active {
      flex-direction: row-reverse;
      .home-body-content {
        align-items: flex-end;
      }
    }
  }
  .home-bottom {
    position: absolute;
    bottom: 0;
    width: 100%;
    .home-bottom-container {
      display: flex;
      flex-direction: row;
      border: 1px solid #999;
      border-radius: 10px;
      .weui-cell {
        flex: 1;
      }
    }
  }
}
</style>
