import express from "express";
import {
  uploadThumbnails,
  uploadEditedShorts,
  uploadEditedVideos,
  saveThumbnails,
  saveShorts,
  saveVideos,
} from "../controller/controller.js";
import multer, { memoryStorage } from "multer";

const upload = multer({ storage: memoryStorage() });

const router = express.Router();

router.post("/Thumbnails", upload.single("file"), (req, res) => {
  uploadThumbnails(req, res);
});

router.post("/saveThumbnails", (req, res) => {
  saveThumbnails(req, res);
});

router.post("/EditedShorts", upload.single("file"), (req, res) => {
  uploadEditedShorts(req, res);
});

router.post("/saveShorts", (req, res) => {
  saveShorts(req, res);
});

router.post("/EditedVideos", upload.single("file"), (req, res) => {
  uploadEditedVideos(req, res);
});

router.post("/saveVideos", (req, res) => {
  saveVideos(req, res);
});

export default router;
