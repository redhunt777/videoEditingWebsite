import express from "express";
import {
  deleteThumbnails,
  deleteVideos,
  deleteShorts,
} from "../controller/controller.js";

const router = express.Router();

router.delete("/thumbnails", (req, res) => {
  deleteThumbnails(req, res);
});

router.delete("/videos", (req, res) => {
  deleteVideos(req, res);
});

router.delete("/shorts", (req, res) => {
  deleteShorts(req, res);
});

export default router;
