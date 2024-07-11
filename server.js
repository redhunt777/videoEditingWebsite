import express from "express";
import { configDotenv } from "dotenv";
import morgan from "morgan";
import { loginAdmin, home, admin } from "./controller/controller.js";
import { fileURLToPath } from "url";
import verifyToken from "./middleware/middleware.js";
import cookieParser from "cookie-parser";
import path from "path";
import Uploadrouter from "./routes/upload.js";
import deleterouter from "./routes/delete.js";
import mongoose from "mongoose";

configDotenv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();
server.use(morgan("dev"));
server.use(cookieParser());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.set("views", path.join(__dirname, "views"));
server.use(express.static("views"));
server.set("view engine", "ejs");
server.use("/uploads", Uploadrouter);
server.use("/delete", deleterouter);
server.setTimeout(300000);

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.URL);
  console.log("Connected MongoDB");
}

server.post("/loginAdmin", (req, res) => {
  loginAdmin(req, res);
});

server.get("/", (req, res) => {
  home(req, res);
});

server.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "resume.html"));
});

server.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "contact.html"));
});

server.get("/admin", verifyToken, (req, res) => {
  admin(req, res);
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
