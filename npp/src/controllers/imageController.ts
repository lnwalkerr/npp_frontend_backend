import { deleteFile, fileUpload } from "../utils/fileUpload";
import ImageModel from "../models/image";
import { Utils } from "../utils/utils";


export async function createRepository(req, res, next) {
  try {
    const { title } = req.body;
    const mode = process.env.STORAGE_MODE || "local";

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image file is required",
      });
    }

    const images = [];

    for (const file of req.files) {
      const { url } = await fileUpload(file, mode);
      images.push({ url }); // ✅ store object instead of string
    }

    const newImage = new ImageModel({
      title,
      images,
      created_at: Utils.indianTimeZone(),
    });

    await newImage.save();

    res.status(201).json({
      success: true,
      message: "Repository created successfully",
      data: newImage,
    });
  } catch (error) {
    next(error);
  }
}


export async function getAllRepositories(req, res, next) {
  try {
    const repositories = await ImageModel.find();

    // Add imageCount field to each repository
    const data = repositories.map((repo) => ({
      ...repo.toObject(),
      imageCount: Array.isArray(repo.images) ? repo.images.length : 0,
    }));

    res.status(200).json({
      success: true,
      message: "Repositories fetched successfully",
      count: data.length, // total repositories
      data, // includes imageCount for each
    });
  } catch (error) {
    next(error);
  }
}


export async function getRepositoryById(req, res, next) {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({
                message: "Repository ID is required",
            });
        }
        const repository = await ImageModel.findById(id);

        if (!repository) {
            return res.status(404).json({
                message: "Repository not found",
            });
        }
         res.status(200).json({
            message: "Repository fetched successfully",
            data: repository,
        });
    } catch (error) {
        next(error);
    }
}


export async function updateRepository(req, res, next) {
  try {
    const { id, title, deleteImageIds } = req.body; 
    const mode = process.env.STORAGE_MODE || "local";

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Repository ID is required",
      });
    }

    const repository = await ImageModel.findById(id);
    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found",
      });
    }

    // ✅ Update title if provided
    if (title) repository.title = title;

    // ✅ Handle image deletions
    if (deleteImageIds && deleteImageIds.length > 0) {
      for (const imageId of deleteImageIds) {
        const imageToDelete = repository.images.id(imageId);
        if (imageToDelete) {
          // Delete the file (local or S3)
          await deleteFile(imageToDelete.url, mode);

          // Remove image from array
          imageToDelete.deleteOne();
        }
      }
    }

    // ✅ Handle new uploads (if any)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const { url } = await fileUpload(file, mode);
        repository.images.push({ url });
      }
    }

    repository.updated_at = Utils.indianTimeZone();

    await repository.save();

    res.status(200).json({
      success: true,
      message: "Repository updated successfully",
      data: repository,
    });
  } catch (error) {
    console.error("Error in updateRepository:", error);
    next(error);
  }
}