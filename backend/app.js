import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./db/connectDB.js";
import authRoute from "./routes/authRoute.js";


dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

//USE MIDDLEWARE
app.use(express.json()); //It allows parsing incomeing body as req.body
app.use(cookieParser()); //It allows the parsing of incoming cookies request


app.use("/api/auth", authRoute);

app.get('/', (req, res) => {
    res.send("Index");
})

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  });


// app.listen(PORT, () => {
//     connectDB();
//     console.log(`Server is running on port ${PORT}`);
// })