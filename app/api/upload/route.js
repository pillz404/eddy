import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Upload file to Blob
    const blob = await put(`products/${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    });

  } catch (error) {
    return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
  }
}
