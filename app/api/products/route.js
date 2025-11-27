import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// GET — Fetch all products
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM products ORDER BY id DESC;`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
  }
}

// POST — Add product
export async function POST(req) {
  try {
    const { name, price, category, image_url, image_path } = await req.json();

    const result = await sql`
      INSERT INTO products (name, price, category, image_url, image_path)
      VALUES (${name}, ${price}, ${category}, ${image_url}, ${image_path})
      RETURNING *;
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Insert error", details: error.message }, { status: 500 });
  }
}

// DELETE — Remove product
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

  try {
    await sql`DELETE FROM products WHERE id = ${id}`;
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete error", details: error.message }, { status: 500 });
  }
}
