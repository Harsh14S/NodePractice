import app from "./src/app.js";
import config from "./src/config/config.js";
import { connectDB } from "./src/db/index.js";

const port = config.PORT || 8000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Listened error while connecting DB: ", error);
    });
    app.listen(port, () => {
      console.log("Server is running on ", port);
    });
  })
  .catch((error) => {
    console.log("MONGO db connection failed !!! ", error);
  });
