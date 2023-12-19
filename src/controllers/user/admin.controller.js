import Validator from "validatorjs";
import RESPONSE from "../../helpers/response.js";
import { User } from "../../models/users.model.js";

const AdminCreate = async (req, res) => {
  const validation = new Validator(req.body, {
    username: "required",
    email: "required|email",
    contact_no: "required|digits:10",
    password: "required",
    role: "required|in:admin,user",
  });

  if (validation.fails()) {
    const errorMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(errorMessage));
  }

  try {
    const {
      body: { username, email, contact_no, password, role },
    } = req;

    const newUser = await User.create({
      username,
      email,
      contact_no,
      password,
      role,
    });

    const findCreatedUser = await User.findById(newUser._id).select("-__v");

    return RESPONSE.success(res, "User created successfully", findCreatedUser);
  } catch (error) {
    // sending error response
    return RESPONSE.error(res, 9999, 500, error);
  }
};

export { AdminCreate };
