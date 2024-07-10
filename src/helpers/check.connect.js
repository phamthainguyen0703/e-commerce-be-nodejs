"use strict";
const mongoose = require("mongoose");
const _SECONDS = 5000;
const os = require("os");
const process = require("process");

// count connect
const countConnect = () => {
  const numConnections = mongoose.connections.length;
  console.log("🚀 ~ countConnect ~ numConnections:", numConnections);
};

// check overload
const checkOverload = () => {
  setInterval(() => {
    const numConnections = mongoose.connections.length;
    const munCore = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    //example maximum munber of connections based on number of cores
    const maxConnections = munCore * 5;

    console.log(`Active connections: ${numConnections}`);
    console.log(`memoryUsage :: ${memoryUsage / 1024 / 1024} MB`);

    if (numConnections > maxConnections) {
      console.log(`Connection overloaded`);
    }
  }, _SECONDS); // monitor every 5 seconds
};

module.exports = { countConnect, checkOverload };
