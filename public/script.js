// Egypt Store - Main Frontend Script

const API_URL = 'http://localhost:5000/api';

// Fetch and display products
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();
    
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-image">🛍️</div>
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-price">${product.price} جنيه</div>
          <button class="btn-add-cart" onclick="addToCart('${product._id}')">أضف للعربة</button>
        </div>
      `;
      productList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function addToCart(productId) {
  alert('تم إضافة المنتج للعربة!');
}

// Load products on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProducts);
} else {
  loadProducts();
}