document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin JS loaded!");
});


/* -------------------------------
   SIMPLE PASSWORD CHECK
--------------------------------*/
const ADMIN_PASSWORD = "mySecret123";

function checkPassword() {
  const entered = document.getElementById("admin-pass").value;
  if (entered === ADMIN_PASSWORD) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    listProducts();
  } else {
    alert("❌ Wrong password!");
  }
}


/* -------------------------------
   UPLOAD IMAGE TO BLOB
--------------------------------*/
async function uploadImageToBlob(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");

  return data; // { url, pathname }
}


/* -------------------------------
   SAVE PRODUCT TO POSTGRES
--------------------------------*/
async function saveProduct(product) {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.details || "DB save failed");

  return data;
}


/* -------------------------------
   LIST PRODUCTS (USES #product-list)
--------------------------------*/
async function listProducts() {
  const container = document.getElementById("product-list");
  if (!container) {
    console.error("❌ product-list DIV NOT FOUND");
    return;
  }

  container.innerHTML = "Loading products...";

  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Failed to fetch");

    const products = await res.json();

    if (!products.length) {
      container.innerHTML = "<p>No products added yet.</p>";
      return;
    }

    container.innerHTML = "";

    products.forEach(p => {
      const div = document.createElement("div");
      div.className = "product-box";
      div.style.border = "1px solid #ddd";
      div.style.padding = "10px";
      div.style.margin = "10px 0";

      div.innerHTML = `
        <strong>${escapeHtml(p.name)}</strong> — ₦${Number(p.price).toLocaleString()}<br/>
        <small>${escapeHtml(p.category)}</small><br/>
        <img src="${p.image_url}" style="width:120px; margin-top:8px; display:block;" />
        <button class="delete-btn" data-id="${p.id}" style="margin-top:10px;">Delete</button>
      `;

      // Add delete logic
      div.querySelector(".delete-btn").addEventListener("click", () => {
        deleteProduct(p.id);
      });

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='color:red'>❌ Failed to load products.</p>";
  }
}


/* -------------------------------
   DELETE PRODUCT
--------------------------------*/
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || data.details || "Delete failed");

    alert("Product deleted!");
    listProducts();
  } catch (err) {
    console.error(err);
    alert("❌ Delete failed: " + err.message);
  }
}


/* -------------------------------
   HTML ESCAPER (Security)
--------------------------------*/
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[m]);
}


/* -------------------------------
   FORM SUBMIT — ADD PRODUCT
--------------------------------*/
document.getElementById("product-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("addProductBtn");

  const name = document.getElementById("pname").value.trim();
  const price = Number(document.getElementById("pprice").value);
  const category = document.getElementById("pcategory").value.trim();
  const file = document.getElementById("pimage").files[0];

  if (!name || !price || !category || !file) {
    alert("⚠️ All fields are required");
    return;
  }

  // Disable button
  submitBtn.textContent = "Uploading...";
  submitBtn.disabled = true;

  try {
    // Upload image
    const uploadRes = await uploadImageToBlob(file);

    // Save product data
    await saveProduct({
      name,
      price,
      category,
      image_url: uploadRes.url,
      image_path: uploadRes.pathname,
    });

    alert("✅ Product added successfully!");

    e.target.reset();
    listProducts();

  } catch (err) {
    console.error(err);
    alert("❌ " + err.message);
  }

  // Reset button
  submitBtn.disabled = false;
  submitBtn.textContent = "Add Product";
});


// Load products immediately
listProducts();
