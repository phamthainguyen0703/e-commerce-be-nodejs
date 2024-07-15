"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");

//service
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static logIn = async ({ email, password, refreshToken = null }) => {
    /*
      1 - check email in dbs
      2 - check password in dbs
      3 - create AccessToken vs RefreshToken and save to dbs
      4 - generate tokens
      5 - get data return login
  */

    //step 1
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Invalid email");
    }
    //step 2: check password in dbs
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Invalid password");

    //step 3: create AccessToken vs RefreshToken and save to dbs
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    //step 4:  generate tokens
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );
    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId,
    });
    return {
      metadata: {
        shop: getInfoData({
          fields: ["_id", "name", "email"],
          object: foundShop,
        }),
        tokens,
      },
    };
  };

  static logOut = async (KeyStore) => {
    const deleteKey = await KeyTokenService.removeKeyById(KeyStore._id);
    console.log("🚀 ~ AccessService ~ logOut= ~ deleteKey:", deleteKey);
    return deleteKey;
  };

  static signUp = async ({ name, email, password }) => {
    try {
      //step 1: check email exists?
      const holderShop = await shopModel.findOne({ email }).lean();

      if (holderShop) {
        throw new BadRequestError("Email already exists.");
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

        //publicKey cryptoGraphy Standards
        // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        //   modulusLength: 4096,
        //   publicKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        //   privateKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        // });

        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        console.log({ privateKey, publicKey }); // save collection KeyStore

        const KeyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
        });

        if (!KeyStore) {
          return {
            //throw new BadRequestError("Email already exists.");
            code: "XXXXXXXX",
            message: "publicKeyString Error",
          };
        }

        // console.log("publicKeyString: ", publicKeyString);
        // const publicKeyObject = crypto.createPublicKey(publicKeyString);
        // console.log(
        //   "🚀 ~ AccessService ~ signUp= ~ publicKeyObject:",
        //   publicKeyObject
        // );

        //step 3: create token pair
        const tokens = await createTokenPair(
          { userId: newShop._id, email: newShop.email },
          publicKey,
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

  static handleRefreshToken = async (refreshToken) => {
    // kiểm tra xem token đã được sử dụng hay chưa
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    //nếu có => xóa tất cả token trong keyStore
    if (foundToken) {
      //decode xem ai dang login
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      console.log({ userId, email });
      // xoa
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("something went wrong!!! Please login");
    }
    //nếu không => verify token
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) {
      throw new AuthFailureError("Shop not found");
    }

    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    console.log("2---", { userId, email });

    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Invalid email");
    }
    // create new token pair
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );
    //update token
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, //đã được sử dụng để lấy token mới
      },
    });
    return {
      user: { userId, email },
      tokens,
    };
  };
}
module.exports = AccessService;
