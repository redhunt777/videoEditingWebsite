import express from "express";
import {
  saveThumbnails,
  saveShorts,
  saveVideos,
} from "../controller/controller.js";

const router = express.Router();

router.post("/saveThumbnails", (req, res) => {
  saveThumbnails(req, res);
});

router.post("/saveShorts", (req, res) => {
  saveShorts(req, res);
});

router.post("/saveVideos", (req, res) => {
  saveVideos(req, res);
});

export default router;
