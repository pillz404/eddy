// public/js/app.js
const WHATSAPP_NUMBER = "2347035074453";
const grid = document.getElementById("product-list");

async function fetchProducts() {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p style='color:red'>Could not load products.</p>";
    return [];
  }
}

function openWhatsApp(name, price) {
  const msg = encodeURIComponent(`Hi, I'm interested in *${name}* (₦${price}).`);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

function createCard(p) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <img src="${p.image_url}" alt="${escapeHtml(p.name)}" />
    <h3>${escapeHtml(p.name)}</h3>
    <p>₦${Number(p.price).toLocaleString()}</p>
    <small>${escapeHtml(p.category)}</small>
    <div style="margin-top:8px"><button>Order</button></div>
  `;
  div.querySelector("button").addEventListener("click", () =>
    openWhatsApp(p.name, p.price)
  );
  return div;
}

const grid = document.getElementById("product-list");

async function fetchProducts() {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("API error");
  return await res.json();
}

async function renderProducts() {
  try {
    const products = await fetchProducts();
    grid.innerHTML = "";

    products.forEach(p => {
      const div = document.createElement("div");
      div.className = "product-card";

      div.innerHTML = `
        <img src="${p.image_url}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>₦${Number(p.price).toLocaleString()}</p>
        <small>${p.category}</small>
      `;

      grid.appendChild(div);
    });

  } catch (error) {
    grid.innerHTML = "<p>Failed to load products.</p>";
  }
}

renderProducts();

