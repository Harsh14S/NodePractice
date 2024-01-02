import Validator from "validatorjs";
import RESPONSE from "../../helpers/response.js";
import { User } from "../../models/users.model.js";
import bcrypt from "bcrypt";
import { mailTransporter } from "../../helpers/mailHelper.js";
import { tokenGenerator, tokenVerifier } from "../../helpers/tokenGenerator.js";
import config from "../../config/config.js";
import Email from "email-templates";
import path from "path";

const emailTemp = new Email({
  views: {
    root: path.resolve("src/views"),
    options: {
      extension: "ejs",
    },
  },
});

const SignUp = async (req, res) => {
  // validating the fields
  const validation = new Validator(req.body, {
    username: ["required", "string", "regex:/^[a-z0-9]+$/"],
    email: "required|string|email",
    contact_no: "required|digits:10",
    password: [
      "required",
      "regex:/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%?=*&])(?=.*[A-Z]).{8,}$/",
    ],
  });

  // returning error on validation fail
  if (validation.fails()) {
    const errorMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(errorMessage));
  }

  // main code block
  try {
    const {
      body: { username, email, contact_no, password },
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

const Login = async (req, res) => {
  // validating the fields
  const validation = new Validator(req.body, {
    username: ["required", "string", "min:6"],
    password: [
      "required",
      "regex:/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%?=*&])(?=.*[A-Z]).{8,}$/",
    ],
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
      "-__v -createdAt -updatedAt -password -passwordResetToken"
    );

    return RESPONSE.success(res, "Logged in successfully", findUpdatedUser);
  } catch (error) {
    // sending error response
    return RESPONSE.error(res, 9999, 500, error);
  }
};

const Logout = async (req, res) => {
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

const RequestForgotPassword = async (req, res) => {
  // validating the fields
  const validation = new Validator(req.body, {
    email: ["required", "email"],
  });

  // returning error on validation fail
  if (validation.fails()) {
    const errorMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(errorMessage));
  }

  try {
    const { email } = req.body;

    const findUser = await User.findOne({ email });

    if (!findUser) {
      return RESPONSE.error(res, "User doesn't exists", 404);
    }

    const passwordResetToken = tokenGenerator({ email });

    const updateUser = await User.findByIdAndUpdate(findUser._id, {
      passwordResetToken,
    });

    const findUpdatedUser = await User.findById(updateUser._id);

    if (!findUpdatedUser) {
      return RESPONSE.error(res, "User doesn't exists", 404);
    }
    const link = `${config.URL}/admin/passwordReset?token=${passwordResetToken}`;

    const templates = await emailTemp.renderAll("ForgotPasswordTemplate", {
      token: findUpdatedUser.passwordResetToken,
      link: link,
    });

    await mailTransporter
      .sendMail({
        from: config.MAILER_EMAIL, // sender address
        to: email,
        subject: "Mail Testing", // Subject line
        text: "Password reset link", // plain text body
        html: templates.html, // html body
      })
      .then((resp) => {
        console.log("Response --->", resp.response);
      })
      .catch((error) => {
        console.log("error ---> ", error);
      });

    // returning final response
    return RESPONSE.success(res, "Password forgot email sent successfully");
  } catch (error) {
    // sending error response
    return RESPONSE.error(res, 9999, 500, error);
  }
};

const ForgotPassword = async (req, res) => {
  const validData = { ...req.query, ...req.body };

  // // validating the fields
  const validation = new Validator(validData, {
    token: "required",
    password: [
      "required",
      "regex:/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%?=*&])(?=.*[A-Z]).{8,}$/",
    ],
  });

  // returning error on validation fail
  if (validation.fails()) {
    const errorMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(errorMessage));
  }

  try {
    const { token } = req.query;
    const { password } = req.body;

    const verifyToken = tokenVerifier(token);

    // giving error if token is not proper
    if (verifyToken.error) {
      if (verifyToken.name === "TokenExpiredError") {
        return RESPONSE.error(res, "Password reset token expired", 404);
      } else {
        return RESPONSE.error(res, "Password reset token error");
      }
    }

    const { email } = verifyToken;
    // finding the user based on email
    const findUser = await User.findOne({ email });

    if (!findUser) {
      return RESPONSE.error(res, "User doesn't exists", 404);
    }

    if (!findUser.passwordResetToken) {
      return RESPONSE.error(res, "Already changed password", 404);
    }
    if (findUser.passwordResetToken !== token) {
      return RESPONSE.error(res, "Password reset token doesn't match", 404);
    }

    // hashing newly created password
    const newPassword = bcrypt.hash(password, config.PASSWORD_SALT);

    // updating password and passwordResetToken
    const updateUser = await User.findOneAndUpdate(
      { email },
      { password: newPassword, passwordResetToken: null }
    );

    // fetching updated user
    const updatedUser = await User.findById(updateUser._id);

    if (!updatedUser) {
      return RESPONSE.error(res, "User doesn't exists", 404);
    }

    // returning final response
    return RESPONSE.success(res, "Password reset successfully");
  } catch (error) {
    // sending error response
    return RESPONSE.error(res, 9999, 500, error);
  }
};

const ChangePassword = async (req, res) => {
  // // validating the fields
  const validation = new Validator(req.body, {
    oldPassword: ["required"],
    newPassword: ["required"],
  });

  // returning error on validation fail
  if (validation.fails()) {
    const errorMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(errorMessage));
  }

  try {
    const { oldPassword, newPassword } = req.body;
    if (oldPassword === newPassword) {
      return RESPONSE.error(
        res,
        "New Password password shouldn't be same as previous",
        403
      );
    }
    const currentUser = req.verifiedUser;
    const comparePassword = await bcrypt.compare(
      oldPassword,
      currentUser.password
    );

    if (!comparePassword) {
      return RESPONSE.error(res, "Password doesn't match", 403);
    }

    // hashing newly created password
    const _newPassword = await bcrypt.hash(newPassword, config.PASSWORD_SALT);

    // updating password and passwordResetToken
    const updateUser = await User.findByIdAndUpdate(currentUser._id, {
      password: _newPassword,
    });

    // fetching updated user
    const updatedUser = await User.findById(updateUser._id);

    if (!updatedUser) {
      return RESPONSE.error(res, "User doesn't exists", 404);
    }

    return RESPONSE.success(res, "Password changed successfully");
  } catch (error) {
    // sending error response
    return RESPONSE.error(res, 9999, 500, error);
  }
};

export {
  SignUp,
  Logout,
  Login,
  ForgotPassword,
  RequestForgotPassword,
  ChangePassword,
};
