import { model } from "mongoose";
import * as mongoose from "mongoose";
import { Utils } from "../utils/utils";

const donationSchema = new mongoose.Schema(
  {
    typeOfDonation: {
      type: mongoose.Types.ObjectId,
      ref: "masterData",
      required: true,
    }, //genralFund , campaignFund
    donationCampaign: {
      type: mongoose.Types.ObjectId,
      ref: "donationMaster",
    },
    amount: { type: Number, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    donateByExsitMember: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    created_at: { type: Date, required: true, default: Utils.indianTimeZone },
    updated_at: { type: Date },
  },
  { id: true }
);

export default model("donation", donationSchema);
