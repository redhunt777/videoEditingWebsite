import { signInWithEmailAndPassword } from "firebase/auth";
import jwt from "jsonwebtoken";
import auth from "../firebaseConfig.js";
import { getStorage, ref, deleteObject } from "firebase/storage";
import Thumbnails from "../model/editedThumbnails.js";
import EditedVideosThumbnail from "../model/editedVideosImages.js";
import ShortVideosThumbnail from "../model/editedShortsImages.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loginAdmin = async (req, res) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      req.body.email,
      req.body.password
    );
    const user = userCredential.user;
    console.log("User logged in successfully:", user.email);
    const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, {
      expiresIn: "36h",
    });
    res.cookie("token", token, { httpOnly: true }); // Set cookie with the token
    res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

const home = async (req, res) => {
  const thumbnails = await Thumbnails.find();
  const editedVideos = await EditedVideosThumbnail.find();
  const shorts = await ShortVideosThumbnail.find();
  res.render("index", { thumbnails, editedVideos, shorts });
};

const admin = async (req, res) => {
  try {
    const thumbnails = await Thumbnails.find();
    const editedVideos = await EditedVideosThumbnail.find();
    const shorts = await ShortVideosThumbnail.find();
    res.render("admin", { verified: true, thumbnails, editedVideos, shorts });
  } catch (error) {
    console.error("Error loading admin page", error);
  }
};

const saveThumbnails = async (req, res) => {
  const data = new Thumbnails({
    img_url: req.body.img_url,
    title: req.body.title,
  });
  data.save().then(() => {
    res.status(200).json({ message: "File saved successfully" });
  });
};

const saveShorts = async (req, res) => {
  const data = new ShortVideosThumbnail({
    img_url: req.body.img_url,
    title: req.body.title,
    video_url: req.body.video_url,
  });
  data.save().then(() => {
    res.status(200).json({ message: "File saved successfully" });
  });
};

const saveVideos = async (req, res) => {
  const data = new EditedVideosThumbnail({
    img_url: req.body.img_url,
    video_url: req.body.video_url,
    title: req.body.title,
  });
  data.save().then(() => {
    res.status(200).json({ message: "File saved successfully" });
  });
};

const deleteThumbnails = async (req, res) => {
  await Thumbnails.findOneAndDelete({
    title: req.body.title,
  }).then(() => {
    const storage = getStorage();
    const desertRef = ref(storage, "thumbnails/" + req.body.title);
    deleteObject(desertRef).then(() => {
      res.status(200).json({ message: "File deleted successfully" });
    });
  });
};

const deleteVideos = async (req, res) => {
  await EditedVideosThumbnail.findOneAndDelete({
    title: req.body.title,
  }).then(() => {
    const storage = getStorage();
    const desertRef = ref(storage, "EditedVideosThumbnail/" + req.body.title);
    deleteObject(desertRef).then(() => {
      res.status(200).json({ message: "File deleted successfully" });
    });
  });
};

const deleteShorts = async (req, res) => {
  console.log(req.body);
  await ShortVideosThumbnail.findOneAndDelete({
    title: req.body.title,
  }).then(() => {
    const storage = getStorage();
    const desertRef = ref(storage, "ShortVideosThumbnail/" + req.body.title);
    deleteObject(desertRef).then(() => {
      res.status(200).json({ message: "File deleted successfully" });
    });
  });
};

export {
  loginAdmin,
  home,
  admin,
  deleteThumbnails,
  deleteVideos,
  deleteShorts,
  saveThumbnails,
  saveShorts,
  saveVideos,
};
