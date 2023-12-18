import config from "../config/config.js";
import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoLink = `${config.DB_LINK}/${config}`;

  try {
    const connectionInstance = await mongoose.connect(mongoLink);
    console.log(
      "\nMongoDB connected. DB HOST ---> ",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("MongoDB connection ERROR ---> ", error);
    process.exit(1);
  }
};
