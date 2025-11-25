// app/api/upload/route.js
import { put } from "@vercel/blob/server";

/**
 * POST /api/upload
 * Accepts FormData with "file" field.
 * Returns: { url, pathname }
 */
export async function POST(req) {
  try {
    // Ensure token available
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return new Response(
        JSON.stringify({
          error:
            "Server misconfiguration: BLOB_READ_WRITE_TOKEN not set in environment variables.",
        }),
        { status: 500 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file sent." }), {
        status: 400,
      });
    }

    // Read bytes from file
    const bytes = Buffer.from(await file.arrayBuffer());

    // Create unique filename
    const safeName = file.name?.replace(/\s+/g, "-") ?? "upload";
    const filename = `product-images/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}-${safeName}`;

    // Upload using token
    const blob = await put(filename, bytes, {
      access: "public",
      token,
    });

    // blob should include url and pathname
    return new Response(
      JSON.stringify({
        success: true,
        url: blob.url,
        pathname: blob.pathname || filename,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(
      JSON.stringify({ error: "Upload failed", details: err.message }),
      { status: 500 }
    );
  }
}
