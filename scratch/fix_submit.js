const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'admin-panel', 'src', 'pages', 'MenuManagement.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Find and replace the handleSubmit function
const oldPattern = /if \(formData\.hasSizes\) \{[\s\S]*?dataToSubmit\.sizes = \[\];\s*\}/;
const newCode = `if (formData.hasVariants) {
        // Filter out empty variant entries and validate
        dataToSubmit.variants = formData.variants.filter(v => v.name.trim() && v.price);
        if (dataToSubmit.variants.length === 0) {
          toast.error('Please add at least one valid variant');
          return;
        }

        // Check for duplicate names
        const names = dataToSubmit.variants.map(v => v.name.toLowerCase().trim());
        if (new Set(names).size !== names.length) {
          toast.error('Duplicate variant names are not allowed');
          return;
        }

        // Set the base price to the first variant's price for compatibility
        dataToSubmit.price = dataToSubmit.variants[0].price;
        dataToSubmit.hasVariants = true;
      } else {
        dataToSubmit.variants = [];
        dataToSubmit.hasVariants = false;
      }`;

content = content.replace(oldPattern, newCode);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('handleSubmit updated successfully');
