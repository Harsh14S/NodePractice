import Validator from "validatorjs";
import RESPONSE from "../../helpers/response.js";
import { User } from "../../models/users.model.js";
import bcrypt from "bcrypt";

const AdminCreate = async (req, res) => {
  // validating the fields
  const validation = new Validator(req.body, {
    username: ["required", "string", "regex:/^[a-z0-9]+$/"],
    email: "required|string|email",
    contact_no: "required|digits:10",
    password: "required",
    role: "required|in:admin,user",
  });

  // returning error on validation fail
  if (validation.fails()) {
    const errorMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(errorMessage));
  }

  // main code block
  try {
    const {
      body: { username, email, contact_no, password, role },
    } = req;

    //checking if username exist
    if (await User.findOne({ username })) {
      return RESPONSE.error(res, "Username already exists", 409);
    }

    //checking if email exist
    if (await User.findOne({ email })) {
      return RESPONSE.error(res, "Email already taken", 409);
    }

    //checking if contact number exist
    if (await User.findOne({ contact_no })) {
      return RESPONSE.error(res, "Contact number already taken", 409);
    }

    // creating user data in model
    const newUser = await User.create({
      username,
      email,
      contact_no,
      password,
      role,
    });

    // generating token
    const generateToken = await newUser.generateAccessToken();

    // updating token in users data
    const tokenUpdatedRes = await User.findOneAndUpdate(
      {
        _id: newUser._id,
      },
      {
        $set: { token: generateToken },
      }
    );

    // finding the updated user and filtering the required fields
    const findCreatedUser = await User.findById(tokenUpdatedRes._id).select(
      "-__v -createdAt -updatedAt"
    );

    // returning final response
    return RESPONSE.success(res, "User created successfully", findCreatedUser);
  } catch (error) {
    // sending error response
    return RESPONSE.error(res, 9999, 500, error);
  }
};

const AdminLogin = async (req, res) => {
  // validating the fields
  const validation = new Validator(req.body, {
    username: ["required", "string", "min:6"],
    password: "required",
  });

  // returning error on validation fail
  if (validation.fails()) {
    const errorMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(errorMessage));
  }

  try {
    const {
      body: { username, password },
    } = req;

    let condition;
    if (username.trim() && !isNaN(username)) {
      condition = {
        $or: [{ contact_no: username }],
      };
    } else {
      condition = {
        $or: [{ username: username }, { email: username }],
      };
    }
    const findUser = await User.findOne(condition);

    if (!findUser) {
      return RESPONSE.error(res, "User doesn't exists", 404);
    }

    const comparePassword = await bcrypt.compare(password, findUser.password);

    if (!comparePassword) {
      return RESPONSE.error(res, "Invalid credentials", 403);
    }

    // generating token
    const generateToken = await findUser.generateAccessToken();

    // updating token in users data
    const tokenUpdatedRes = await User.findByIdAndUpdate(
      {
        _id: findUser._id,
      },
      {
        $set: { token: generateToken },
      }
    );

    const findUpdatedUser = await User.findById(tokenUpdatedRes._id).select(
      "-__v -createdAt -updatedAt"
    );

    return RESPONSE.success(res, "Logged in successfully", findUpdatedUser);
  } catch (error) {
    // sending error response
    return RESPONSE.error(res, 9999, 500, error);
  }
};

const AdminLogout = async (req, res) => {
  // userdetail from auth middleware
  const verifiedUser = req.verifiedUser;
  try {
    // removing token by updating user
    const updateUser = await User.findByIdAndUpdate(verifiedUser._id, {
      $set: { token: null },
    });

    // finding the updated user and filtering the required fields
    const findUpdatedUser = await User.findById(updateUser._id).select(
      "-__v -createdAt -updatedAt"
    );

    // returning final response
    return RESPONSE.success(res, "Logout successfully", findUpdatedUser);
  } catch (error) {
    // sending error response
    return RESPONSE.error(res, 9999, 500, error);
  }
};

export { AdminCreate, AdminLogout, AdminLogin };
