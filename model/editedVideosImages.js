import { Schema, model } from "mongoose";

const VideosmodelSchema = new Schema({
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

const EditedVideosThumbnail = model("EditedVideosThumbnail", VideosmodelSchema);

export default EditedVideosThumbnail;
