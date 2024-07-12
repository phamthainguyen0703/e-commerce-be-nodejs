"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      //step 1: check email exists?
      const holderShop = await shopModel.findOne({ email }).lean();

      if (holderShop) {
        return {
          code: "ERR_EMAIL_EXISTS",
          message: "Email already exists",
          status: "error",
        };
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        //step 2: create privateKey, publicKey
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
        });
        //publicKey cryptoGraphy Standards

        console.log({ privateKey, publicKey }); // save collection KeyStore

        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });

        if (!publicKeyString) {
          return {
            code: "XXXXXXXX",
            message: "publicKeyString Error",
          };
        }
        console.log("publicKeyString: ", publicKeyString);
        const publicKeyObject = crypto.createPublicKey(publicKeyString);
        console.log(
          "🚀 ~ AccessService ~ signUp= ~ publicKeyObject:",
          publicKeyObject
        );

        //step 3: create token pair
        const tokens = await createTokenPair(
          { userId: newShop._id, email: newShop.email },
          publicKeyString,
          privateKey
        );
        console.log(`created token successfully::`, tokens);
        return {
          code: 201,
          metadata: {
            shop: getInfoData({
              fields: ["_id", "name", "email"],
              object: newShop,
            }),
            // shop: {
            //   _id: newShop._id,
            //   name: newShop.name,
            //   email: newShop.email,
            // },
            tokens,
          },
        };
      }
      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      return {
        code: "XXX",
        message: error.message,
        status: "error",
      };
    }
  };
}
module.exports = AccessService;
