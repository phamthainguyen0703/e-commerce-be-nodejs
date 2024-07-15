"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  logIn = async (req, res, next) => {
    new SuccessResponse({
      message: "Login successfully",
      metadata: await AccessService.logIn(req.body),
    }).send(res);
  };

  logOut = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout successfully",
      metadata: await AccessService.logOut(req.keyStore),
    }).send(res);
  };

  signUp = async (req, res, next) => {
    // return res.status(200).json({
    //   message: "success",
    //   metadata:
    // })
    new CREATED({
      message: "User created successfully",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };

  handleRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: "Get token successfully",
      metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    }).send(res);
  };
}

module.exports = new AccessController();
