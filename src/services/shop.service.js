"use strict";

const shopModel = require("../models/shop.model");

//1 - check email in dbs

const findByEmail = async ({
  email,
  select = { email: 1, password: 1, name: 1, status: 1, role: 1 },
}) => {
  return await shopModel.findOne({ email }).select(select).lean();
};

module.exports = { findByEmail };
