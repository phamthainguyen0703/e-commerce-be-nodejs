"use strict";

//!dmbg
const { model, Schema, Types, Collection } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "shop";
const COLLECTION_NAME = "shops";
// Declare the Schema of the Mongo model
var shopSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      MaxLength: 150,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    verify: {
      type: Schema.Types.Boolean,
      required: false,
    },
    roles: {
      type: Array,
      default: [],
    },
  },
  { timeStamp: true, Collection: COLLECTION_NAME }
);

//Export the model
module.exports = model(DOCUMENT_NAME, shopSchema);
