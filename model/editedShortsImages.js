import { Schema, model } from "mongoose";

const ShortsmodelSchema = new Schema({
  img_url: {
    type: String,
    required: true,
  },
  video_url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

const ShortVideosThumbnail = model("ShortVideosThumbnail", ShortsmodelSchema);

export default ShortVideosThumbnail;
