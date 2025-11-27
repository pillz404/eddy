document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin JS loaded!");
});

const ADMIN_PASSWORD = "mySecret123";

function checkPassword() {
  const entered = document.getElementById("admin-pass").value;
  if (entered === ADMIN_PASSWORD) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    listProducts();
  } else {
    alert("Wrong password!");
  }
}

async function uploadImageToBlob(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function saveProduct(product) {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function listProducts() {
  const container = document.getElementById("product-list");
  container.innerHTML = "Loading...";

  const res = await fetch("/api/products");
  const products = await res.json();

  if (!products.length) {
    container.innerHTML = "<p>No products yet</p>";
    return;
  }

  container.innerHTML = "";

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-box";

    div.innerHTML = `
      <strong>${p.name}</strong> — ₦${Number(p.price).toLocaleString()}<br/>
      <small>${p.category}</small><br/>
      <img src="${p.image_url}" width="120">
      <button data-id="${p.id}">Delete</button>
    `;

    div.querySelector("button").onclick = () => deleteProduct(p.id);
    container.appendChild(div);
  });
}

async function deleteProduct(id) {
  if (!confirm("Delete product?")) return;

  const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
  await res.json();
  listProducts();
}

document.getElementById("product-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = document.getElementById("addProductBtn");
  btn.textContent = "Uploading...";
  btn.disabled = true;

  const name = document.getElementById("pname").value.trim();
  const price = Number(document.getElementById("pprice").value);
  const category = document.getElementById("pcategory").value.trim();
  const file = document.getElementById("pimage").files[0];

  try {
    const uploaded = await uploadImageToBlob(file);

    await saveProduct({
      name,
      price,
      category,
      image_url: uploaded.url,
      image_path: uploaded.pathname,
    });

    alert("Product added!");
    e.target.reset();
    listProducts();

  } catch (err) {
    alert(err.message);
  }

  btn.textContent = "Add Product";
  btn.disabled = false;
});

listProducts();
