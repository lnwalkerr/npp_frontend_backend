import * as mongoose from "mongoose";
import { model } from "mongoose";
import { Utils } from "../utils/utils";

const userSchema = new mongoose.Schema(
  {
    userType: {
      type: mongoose.Types.ObjectId,
      ref: "userType",
      required: true,
    }, // superAdmin, admin, member
    parentId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: false,
    }, // admin who created you
    candidateId: { type: Number, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true },
    constituency: {
      type: mongoose.Types.ObjectId,
      ref: "masterData",
      required: false,
    },
    registrationType: {
      type: mongoose.Types.ObjectId,
      ref: "masterData",
      required: false,
    },
    politicalExperience: { type: String },
    descriptionForJoinUs: { type: String },
    password: { type: String },
    dob: { type: String },
    profileImage: {
      url: { type: String },
      docSha: { type: String },
    },
    city: { type: String },
    state: { type: String },
    gender: { type: String },
    address: { type: String },
    postalCode: { type: Number },
    country: { type: String },
    otpStatus: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    adminUserPermission: { type: Object , default:{}},
    created_at: { type: Date, default: Utils.indianTimeZone },
    updated_at: { type: Date },
  },
  { id: false }
);

userSchema.index({ candidateId: 1 });
userSchema.index({ phone: 1 });

export default model("user", userSchema);
