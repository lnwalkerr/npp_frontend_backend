import * as mongoose from "mongoose";
import { model } from "mongoose";
import { Utils } from "../utils/utils";

const imageItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    setAsCover: { type: Boolean, default: false },
  },
  { _id: true } // ✅ ensures each image has its own _id
);

const imageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    images: { type: [imageItemSchema], required: true },
    created_at: {
      type: Date,
      required: true,
      default: () => Utils.indianTimeZone(),
    },
    updated_at: { type: Date },
  },
  { id: true }
);

export default model("Image", imageSchema);
