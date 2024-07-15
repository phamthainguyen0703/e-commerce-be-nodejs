"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const asyncHandler = require("../../helpers/asyncHandle");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

//signUp
router.post("/shop/signup", asyncHandler(accessController.signUp));
router.post("/shop/login", asyncHandler(accessController.logIn));

// authentication
router.use(authentication);
router.post("/shop/logout", asyncHandler(accessController.logOut));

module.exports = router;
