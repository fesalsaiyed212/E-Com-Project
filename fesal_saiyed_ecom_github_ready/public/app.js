// Frontend logic for listing products, cart, and orders
const productList = document.getElementById('productList');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const orderForm = document.getElementById('orderForm');
const downloadBtn = document.getElementById('downloadReport');

let cart = [];

async function fetchProducts(){
  const res = await fetch('/api/products');
  const data = await res.json();
  renderProducts(data);
}

function renderProducts(products){
  productList.innerHTML = '';
  const tpl = document.getElementById('productTpl');
  products.forEach(p => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.p-name').textContent = p.name;
    node.querySelector('.p-desc').textContent = p.description;
    node.querySelector('.price').textContent = `₹${p.price}`;
    node.querySelector('.addBtn').addEventListener('click', () => addToCart(p));
    productList.appendChild(node);
  });
}

function addToCart(product){
  const found = cart.find(i => i.id === product.id);
  if(found) found.quantity++;
  else cart.push({...product, quantity:1});
  renderCart();
}

function renderCart(){
  cartItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach(i => {
    total += i.price * i.quantity;
    const div = document.createElement('div');
    div.innerHTML = `<span><strong>${i.name}</strong> — ${i.quantity} × ₹${i.price}</span>
                     <button data-id="${i.id}" class="rm">Remove</button>`;
    cartItemsEl.appendChild(div);
  });
  cartTotalEl.textContent = `Total: ₹${total}`;
  document.querySelectorAll('.rm').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      cart = cart.filter(x => x.id !== id);
      renderCart();
    });
  });
}

orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cart.length) return alert('Cart is empty');
  const fd = new FormData(orderForm);
  const payload = {
    customerName: fd.get('customerName'),
    email: fd.get('email'),
    items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }))
  };
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  if (res.ok) {
    alert('Order placed!');
    cart = [];
    renderCart();
    orderForm.reset();
  } else {
    const txt = await res.json().catch(()=>({}));
    alert('Error: ' + (txt.error || 'unknown'));
  }
});

downloadBtn.addEventListener('click', () => {
  window.location = '/api/report/orders.csv';
});

fetchProducts();
