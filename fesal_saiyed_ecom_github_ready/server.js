// GitHub-ready e-commerce demo for Fesal Saiyed
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory products & orders (swap with DB later)
let products = [
  { id: 'p1', name: 'Classic Oxford Shirt', price: 799, description: 'Crisp white cotton — old-money staple.' },
  { id: 'p2', name: 'Pleated Trousers', price: 999, description: 'High-rise, tailored silhouette.' },
  { id: 'p3', name: 'Wool Topcoat', price: 2499, description: 'Structured and warm.' }
];
let orders = [];

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Product APIs
app.get('/api/products', (_req, res) => res.json(products));
app.get('/api/products/:id', (req, res) => {
  const p = products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});
app.post('/api/products', (req, res) => {
  const { name, price, description } = req.body || {};
  if (!name || price == null) return res.status(400).json({ error: 'name and price are required' });
  const newP = { id: uuidv4(), name, price: Number(price), description: description || '' };
  products.push(newP);
  res.status(201).json(newP);
});

// Order APIs
app.post('/api/orders', (req, res) => {
  const { customerName, email, items } = req.body || {};
  if (!customerName || !email || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'customerName, email, and items are required' });
  }
  const total = items.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity || 1), 0);
  const order = { id: uuidv4(), customerName, email, items, total, createdAt: new Date().toISOString() };
  orders.push(order);
  res.status(201).json(order);
});
app.get('/api/orders', (_req, res) => res.json(orders));

// CSV export
app.get('/api/report/orders.csv', (_req, res) => {
  const header = 'orderId,customerName,email,total,createdAt,items\n';
  const rows = orders.map(o => {
    const itemsStr = (o.items || []).map(i => `${(i.name || '').replace(/"/g,'""')} x${i.quantity || 1}`).join('|');
    return `"${o.id}","${(o.customerName||'').replace(/"/g,'""')}","${(o.email||'').replace(/"/g,'""')}",${o.total},"${o.createdAt}","${itemsStr}"`;
  }).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
  res.send(header + rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fesal Saiyed e-com running at http://localhost:${PORT}`));
