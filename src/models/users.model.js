import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    contact_no: {
      type: Number,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    token: {
      type: String,
      default: null,
    },
  },
  { timeseries: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

UserSchema.methods.generateAccessToken = async function () {
  const accessToken = jwt.sign(
    {
      _id: this._id,
      username: this.username,
    },
    config.ACCESS_TOKEN_SECRET,
    config.ACCESS_TOKEN_EXPIRY
  );

  this.token = accessToken;
  return accessToken;
};

export const User = mongoose.model("User", UserSchema);