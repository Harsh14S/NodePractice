import config from "../config/config.js";
import RESPONSE from "../helpers/response.js";
import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";

const auth = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return RESPONSE.error(res, 401, 401);
  }

  let verifyUser;
  try {
    verifyUser = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return RESPONSE.error(res, 401, 401);
  }
  const verifiedUser = await User.findOne({ _id: verifyUser._id });
  if (verifiedUser.token !== token) {
    return RESPONSE.error(res, 401, 401);
  }
  req.verifiedUser = verifiedUser;
  next();
};

export { auth };
