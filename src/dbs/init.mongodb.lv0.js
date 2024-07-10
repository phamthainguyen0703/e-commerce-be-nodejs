"use strict";
const mongoose = require("mongoose");

const connectString = `mongodb://localhost:27017/shopDev`;

mongoose
  .connect(connectString)
  .then((_) => console.log(`Connect success`))
  .catch((err) => console.log(`Error connecting`));

//dev
if (1 === 1) {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}

module.exports = mongoose;

// Nhược điểm của phương thức này: nếu không phải trên môi trường node( php, java..) => dẫn đến nhiều kết nối đc tạo ra mỗi khi export gây sự cố tải kết nối
