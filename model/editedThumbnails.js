import { Schema, model } from "mongoose";

const ThumbnailsmodelSchema = new Schema({
  img_url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

const Thumbnails = model("thumbnails", ThumbnailsmodelSchema);

export default Thumbnails;
