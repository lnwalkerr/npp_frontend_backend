import { NextRequest, NextResponse } from "next/server";

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

    // Create FormData to send to backend (multer expects 'files' field)
    const backendFormData = new FormData();
    backendFormData.append("title", title);

    // Add files to backend FormData with 'files' key (multer array)
    files.forEach((file) => {
      backendFormData.append("files", file);
    });

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/admin/images/create`, {
      method: "POST",
      body: backendFormData,
      // Don't set Content-Type header - let fetch set it with boundary for FormData
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to create repository" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Repository created successfully",
      data: data.data,
    });

  } catch (error) {
    console.error("Error creating repository:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
