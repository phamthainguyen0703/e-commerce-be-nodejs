"use strict";

const { findById } = require("../services/apiKey.service");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: "forbidden",
      });
    }

    //check objectKey
    const objectKey = await findById(key);
    if (!objectKey) {
      return res.status(403).json({
        message: "forbidden",
      });
    }
    req.objectKey = objectKey;
    return next();
  } catch (error) {}
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objectKey.permissions) {
      return res.status(403).json({
        message: "permission denied",
      });
    }
    console.log(`permissions`, req.objectKey.permissions);
    const validPermissions = req.objectKey.permissions.includes(permission);
    if (!validPermissions) {
      return res.status(403).json({
        message: "permission denied",
      });
    }
    return next();
  };
};

module.exports = { apiKey, permission };
