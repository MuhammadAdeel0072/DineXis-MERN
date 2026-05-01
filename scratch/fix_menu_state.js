const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '..', 'client', 'src', 'pages', 'Menu.jsx');
let menu = fs.readFileSync(menuPath, 'utf-8');

// Fix the broken state declaration
menu = menu.replace(
  'const [selectedVariant, setSelectedSize] = useState(null);',
  'const [selectedVariant, setSelectedVariant] = useState(null);'
);

// Fix all remaining setSelectedSize calls
menu = menu.replace(/setSelectedSize/g, 'setSelectedVariant');

fs.writeFileSync(menuPath, menu, 'utf-8');
console.log('Menu.jsx state fixed');
