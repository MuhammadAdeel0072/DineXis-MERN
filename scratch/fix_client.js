const fs = require('fs');
const path = require('path');

// Fix Menu.jsx
const menuPath = path.join(__dirname, '..', 'client', 'src', 'pages', 'Menu.jsx');
let menu = fs.readFileSync(menuPath, 'utf-8');

// 1. Replace navigation condition
menu = menu.replace(
  "if (product.category === 'Pizza' || product.sizes?.length > 0)",
  "if (product.hasVariants && product.variants?.length > 0)"
);

// 2. Replace all selectedSize with selectedVariant
menu = menu.replace(/selectedSize/g, 'selectedVariant');

// 3. Replace product.sizes with product.variants
menu = menu.replace(/product\.sizes/g, 'product.variants');
menu = menu.replace(/selectedProduct\.sizes/g, 'selectedProduct.variants');

// 4. Fix the size selection label
menu = menu.replace('Select Size', 'Select Variant');

// 5. Fix price display for variant products - show "From Rs. X"
menu = menu.replace(
  `<span className="text-gold font-black text-lg tracking-tighter shrink-0">Rs. {product.price}</span>`,
  `<span className="text-gold font-black text-lg tracking-tighter shrink-0">{product.hasVariants && product.variants?.length > 0 ? \`From Rs. \${Math.min(...product.variants.map(v => v.price))}\` : \`Rs. \${product.price}\`}</span>`
);

fs.writeFileSync(menuPath, menu, 'utf-8');
console.log('Menu.jsx updated');

// Fix ProductDetail.jsx
const detailPath = path.join(__dirname, '..', 'client', 'src', 'pages', 'ProductDetail.jsx');
let detail = fs.readFileSync(detailPath, 'utf-8');

// Replace all selectedSize with selectedVariant
detail = detail.replace(/selectedSize/g, 'selectedVariant');
// Replace sizes with variants
detail = detail.replace(/product\.sizes/g, 'product.variants');
// Fix the label
detail = detail.replace('Select Your Size', 'Select Your Variant');
// Fix toast message
detail = detail.replace(
  "toast.success(`Added ${product.name} (${selectedVariant?.name || 'Regular'}) to cart`",
  "toast.success(`${product.name} (${selectedVariant?.name}) added to cart`"
);
// Increase font sizes on variant buttons
detail = detail.replace(
  /className=\{`text-xl font-black uppercase tracking-widest mb-2/g,
  'className={`text-2xl font-black uppercase tracking-widest mb-2'
);
detail = detail.replace(
  'className="text-2xl font-bold text-white tracking-tighter"',
  'className="text-xl font-bold text-white tracking-tighter"'
);

fs.writeFileSync(detailPath, detail, 'utf-8');
console.log('ProductDetail.jsx updated');

// Fix Cart.jsx
const cartPath = path.join(__dirname, '..', 'client', 'src', 'pages', 'Cart.jsx');
let cart = fs.readFileSync(cartPath, 'utf-8');
cart = cart.replace(/selectedSize/g, 'selectedVariant');
cart = cart.replace('Size: {item.selectedVariant.name}', 'Variant: {item.selectedVariant.name}');
fs.writeFileSync(cartPath, cart, 'utf-8');
console.log('Cart.jsx updated');

// Fix Checkout.jsx
const checkoutPath = path.join(__dirname, '..', 'client', 'src', 'pages', 'Checkout.jsx');
let checkout = fs.readFileSync(checkoutPath, 'utf-8');
checkout = checkout.replace(/selectedSize/g, 'selectedVariant');
// Add variant display in order review
checkout = checkout.replace(
  `<span>Qty: {item.qty}</span>`,
  `<span>Qty: {item.qty}</span>\n                            {item.selectedVariant?.name && <><span className="w-1 h-1 bg-white/10 rounded-full"></span><span>{item.selectedVariant.name}</span></>}`
);
fs.writeFileSync(checkoutPath, checkout, 'utf-8');
console.log('Checkout.jsx updated');

console.log('All client files updated successfully!');
