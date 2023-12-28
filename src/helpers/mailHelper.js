import nodemailer from "nodemailer";
import config from "../config/config.js";

export const mailTransporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  // service: 'gmail',
  // secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: config.MAILER_EMAIL,
    pass: config.MAILER_PASS,
  },
});
