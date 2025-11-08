import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    // Get all files from form data
    const files: File[] = [];
    const formDataEntries = Array.from(formData.entries());
    for (const [key, value] of formDataEntries) {
      if (value instanceof File && key.startsWith("photo_")) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one image file is required" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, continue
    }

    // Save files locally
    const savedFiles: { filename: string; originalName: string; url: string }[] = [];

    for (const file of files) {
      const timestamp = Date.now();
      const randomId = Math.round(Math.random() * 1e9);
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `${timestamp}-${randomId}.${extension}`;

      const filePath = join(uploadsDir, filename);
      const bytes = await file.arrayBuffer();
      const buffer = new Uint8Array(bytes);

      await writeFile(filePath, buffer);

      savedFiles.push({
        filename,
        originalName: file.name,
        url: `/uploads/${filename}`
      });
    }

    // Create mock response (similar to backend structure)
    const mockData = {
      _id: `mock_${Date.now()}`,
      title,
      images: savedFiles.map(file => ({ url: file.url })),
      created_at: new Date().toISOString(),
      imageCount: savedFiles.length
    };

    return NextResponse.json({
      success: true,
      message: "Repository created successfully (local storage)",
      data: mockData,
    });

  } catch (error) {
    console.error("Error creating repository:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
