const http = require("http");
const mysql = require("mysql");
const io = require("socket.io");

// 连接数据库
let db = mysql.createPool({
  host: "localhost",
  user: "test",
  password: "test",
  database: "websocket"
});

// 定义检验信息
const userRegexp = /^[a-zA-z_]\w{5,32}$/;
const passRegexp = /^.{6,32}$/;
// 创建 http 服务器
let httpServer = http.createServer();
httpServer.listen(8080);
console.log("创建服务器...");

// 创建 WebSocket 服务器
// 创建数组用于存储连接对象
let clients = [];
let ws = io.listen(httpServer);
// 监听连接
ws.on("connection", sock => {
  console.log("一位用户连接....");
  clients.push(sock);
  // 利用闭包保存当前连接的用户数据
  let cur_username = ""; // 当前登录的用户名
  let cur_userId = 0; // 当前用户 Id

  // 注册处理
  sock.on("register", (user, pass) => {
    // 验证数据
    console.log("注册信息: " + user + ":" + pass);
    if (!userRegexp.test(user)) {
      sock.emit("register_result", 1, "用户名不符合规范");
    } else if (!passRegexp.test(pass)) {
      sock.emit("register_result", 1, "密码不符合规范");
    } else {
      // 检查用户名是否存在
      db.query(
        `SELECT ID FROM user_table WHERE username="${user}"`,
        (err, data) => {
          // 判断是否出错
          if (err) {
            console.log(err);
            sock.emit("register_result", 1, "数据库有错误");
          } else if (data.length > 0) {
            sock.emit("register_result", 1, "用户名已存在");
          } else {
            // 插入数据
            db.query(
              `INSERT INTO user_table (username, password, online) VALUES ("${user}", "${pass}", 0)`,
              err => {
                if (err) {
                  console.log(err);
                  sock.emit("register_result", 1, "数据库有错误");
                } else {
                  sock.emit("register_result", 0, "注册成功");
                }
              }
            );
          }
        }
      );
    }
  });

  // 登录处理
  sock.on("login", (user, pass) => {
    console.log("登录信息: " + user + ":" + pass);
    // 检验登录信息
    if (!userRegexp.test(user)) {
      sock.emit("login_result", 1, "用户名不符合规范");
    } else if (!passRegexp.test(pass)) {
      sock.emit("login_result", 1, "密码不符合规范");
    } else {
      // 登录操作
      db.query(
        `SELECT ID, password FROM user_table WHERE username="${user}"`,
        (err, data) => {
          // 判断是否出错
          if (err) {
            console.log(err)
            sock.emit("login_result", 1, "数据库出错");
          } else if (data.length === 0) {
            sock.emit("login_result", 1, "用户不存在");
          } else if (data[0].password !== pass) {
            sock.emit("login_result", 1, "用户名或密码有误");
          } else {
            // 修改在线状态
            db.query(
              `UPDATE user_table SET online=1 WHERE ID="${data[0].ID}"`,
              err => {
                if (err) {
                  console.log(err)
                  sock.emit("login_result", 1, "数据库出错");
                } else {
                  sock.emit("login_result", 0, "登录成功");
                  cur_username = user;
                  cur_userId = data[0].ID;
                }
              }
            );
          }
        }
      );
    }
  });

  // 发送消息
  sock.on("msg_send", context => {
    if (!context) {
      sock.emit("msg_result", 1, "消息文本不能为空");
    } else {
      // 广播
      clients.forEach(client => {
        // 当前用户不用发送消息
        if (client === sock) return;
        client.emit("msg", cur_username, context);
      });
      sock.emit("msg_result", 0, "发送成功");
    }
  });
  // 离线处理
  //离线
  sock.on("disconnect", function() {
    // 修改在线状态
    db.query(`UPDATE user_table SET online=0 WHERE ID=${cur_userId}`, err => {
      if (err) {
        console.log(err);
        console.log("数据库出错");
      }
      // 更新状态
      cur_username = "";
      cur_userId = 0;
      clients = clients.filter(item => item !== sock);
    });
  });
});
