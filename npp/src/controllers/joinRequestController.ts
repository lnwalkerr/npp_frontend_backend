import { Request, Response } from "express";
import JoinRequest from "../models/joinRequest";
import User from "../models/user";

export async function createJoinRequest (req: Request, res: Response)  {
  try {
    const { userId, constituency, registrationType, remarks, experience } = req.body;

    // ✅ 1. Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ 2. Optional: Check if already has a pending request
    const existing = await JoinRequest.findOne({ userId, status: "pending" });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending join request.",
      });
    }

    // ✅ 3. Create the join request
    const newRequest = new JoinRequest({
      userId,
      constituency,
      registrationType,
      remarks,
      experience,
    });

    await newRequest.save();

    // ✅ 4. Send success response
    res.status(201).json({
      success: true,
      message: "Join request submitted successfully.",
      data: newRequest,
    });
  } catch (error: any) {
    console.error("Error creating join request:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating join request.",
      error: error.message,
    });
  }
};


export async function getJoinRequests(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { status, userId } = req.query;
    const filters: any = {};
    if (status) filters.status = status;
    if (userId) filters.userId = userId;

    const requests = await JoinRequest.find(filters)
      .populate("userId", "firstName lastName email phone")
      .populate("constituency", "title value") 
      .populate("registrationType", "title value")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await JoinRequest.countDocuments(filters);

    res.status(200).json({
      success: true,
      message: "Join requests fetched successfully",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: requests,
    });
  } catch (error: any) {
    console.error("Error fetching join requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching join requests.",
      error: error.message,
    });
  }
};

export async function updateJoinRequestStatus(req: Request, res: Response) {
  try {
    const { id,status } = req.body; // new status
    const allowedStatuses = ["pending", "approved", "rejected"];

    // ✅ Validate status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    // ✅ Find and update the join request
    const updated = await JoinRequest.findByIdAndUpdate(
      id,
      { status, updated_at: new Date() },
      { new: true }
    )
      .populate("userId", "firstName lastName email phone")
      .populate("constituency", "title value")
      .populate("registrationType", "title value");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Join request not found" });
    }

    res.status(200).json({
      message: `Join request ${status} successfully.`,
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating join request status:", error);
    res.status(500).json({
      message: "Server error while updating join request status.",
      error: error.message,
    });
  }
};
