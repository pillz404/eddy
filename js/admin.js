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
