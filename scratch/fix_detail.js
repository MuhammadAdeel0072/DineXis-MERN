const fs = require('fs');
const path = require('path');

const detailPath = path.join(__dirname, '..', 'client', 'src', 'pages', 'ProductDetail.jsx');
let detail = fs.readFileSync(detailPath, 'utf-8');

// Fix the broken state declaration
detail = detail.replace(
  'const [selectedVariant, setSelectedSize] = useState(null);',
  'const [selectedVariant, setSelectedVariant] = useState(null);'
);

// Fix all remaining setSelectedSize calls
detail = detail.replace(/setSelectedSize/g, 'setSelectedVariant');

// Also fix variable name 'size' in the map callback to 'variant'
detail = detail.replace(
  /product\.variants\.map\(\(size, idx\)/g,
  'product.variants.map((variant, idx)'
);
detail = detail.replace(
  /onClick=\{.*?setSelectedVariant\(size\)\}/g,
  'onClick={() => setSelectedVariant(variant)}'
);
detail = detail.replace(/size\.name/g, 'variant.name');
detail = detail.replace(/size\.price/g, 'variant.price');

fs.writeFileSync(detailPath, detail, 'utf-8');
console.log('ProductDetail.jsx fixed');
