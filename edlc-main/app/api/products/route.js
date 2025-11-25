// app/api/products/route.js
import { sql } from "@vercel/postgres";
import { del as deleteBlob } from "@vercel/blob/server";

/**
 * GET  -> list products
 * POST -> add product (expects JSON: { name, price, category, image_url, image_path })
 * DELETE -> delete product by id (query param ?id= or JSON { id })
 */

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM products ORDER BY id DESC;`;
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch products", details: err.message }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, price, category, image_url, image_path } = body;

    if (!name || price == null || !category || !image_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO products (name, price, category, image_url, image_path)
      VALUES (${name}, ${price}, ${category}, ${image_url}, ${image_path})
      RETURNING *;
    `;

    return new Response(JSON.stringify({ success: true, product: result.rows[0] }), {
      status: 201,
    });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to save product", details: err.message }),
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    // accept id from query or JSON body
    const url = new URL(req.url);
    const idFromQuery = url.searchParams.get("id");
    let id = idFromQuery;

    if (!id) {
      // try body
      const body = await req.json().catch(() => null);
      if (body?.id) id = body.id;
    }

    if (!id) {
      return new Response(JSON.stringify({ error: "Product id required" }), {
        status: 400,
      });
    }

    // Find product (to get image_path)
    const { rows: found } = await sql`SELECT * FROM products WHERE id = ${id};`;
    if (!found || found.length === 0) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
      });
    }
    const product = found[0];

    // Delete DB row
    await sql`DELETE FROM products WHERE id = ${id};`;

    // Attempt to delete blob if image_path present and token provided
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (product.image_path && token) {
        // product.image_path should be the pathname saved when uploading
        await deleteBlob(product.image_path, { token });
      }
    } catch (blobErr) {
      // non-fatal: log and continue
      console.warn("Failed to delete blob for product", id, blobErr);
    }

    return new Response(JSON.stringify({ success: true, deletedId: id }), {
      status: 200,
    });
  } catch (err) {
    console.error("DELETE /api/products error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to delete product", details: err.message }),
      { status: 500 }
    );
  }
}
