
 const ADMIN_PASSWORD = "mySecret123";

    function checkPassword() {
      const entered = document.getElementById("admin-pass").value;
      if (entered === ADMIN_PASSWORD) {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-panel").style.display = "block";
        loadProducts();
      } else {
        alert("❌ Wrong password!");
      }
    }
// public/js/admin.js

async function uploadImageToBlob(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Upload failed");
  }

  // returns { url, pathname }
  return data;
}

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

async function listProducts() {
  const container = document.getElementById("existing");
  container.innerHTML = "Loading...";

  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Failed to load");
    const products = await res.json();
    if (!products.length) {
      container.innerHTML = "<p>No products yet.</p>";
      return;
    }

    container.innerHTML = "";
    products.forEach(p => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ddd";
      div.style.padding = "10px";
      div.style.marginBottom = "8px";
      div.innerHTML = `
        <strong>${escapeHtml(p.name)}</strong> — ₦${Number(p.price).toLocaleString()} <br/>
        <small>${escapeHtml(p.category)}</small><br/>
        <img src="${p.image_url}" alt="${escapeHtml(p.name)}" style="width:120px; display:block; margin-top:8px;" />
        <button data-id="${p.id}" style="margin-top:8px;">Delete</button>
      `;
      const btn = div.querySelector("button");
      btn.addEventListener("click", () => deleteProduct(p.id));
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='color:red'>Failed to load products.</p>";
  }
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  try {
    const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || "Delete failed");
    await listProducts();
    alert("Deleted");
  } catch (err) {
    console.error(err);
    alert("Delete failed: " + err.message);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (m) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m];
  });
}

document.getElementById("product-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("pname").value.trim();
  const price = Number(document.getElementById("pprice").value);
  const category = document.getElementById("pcategory").value.trim();
  const file = document.getElementById("pimage").files[0];

  if (!name || !price || !category || !file) {
    return alert("All fields required");
  }

  const submitBtn = e.target.querySelector("button[type='submit']");
  submitBtn.textContent = "Uploading...";
  submitBtn.disabled = true;
  

  try {
    // Upload to Blob
    const uploadRes = await uploadImageToBlob(file);
    // uploadRes = { url, pathname }

    // Save to Postgres: include both image_url and image_path
    const saveRes = await saveProduct({
      name,
      price,
      category,
      image_url: uploadRes.url,
      image_path: uploadRes.pathname,
    });

    alert("Product saved");
    // reset form
    e.target.reset();
    await listProducts();
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Upload Product";
  }
});

// initial list
listProducts();
