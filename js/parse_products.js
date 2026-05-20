const fs = require('fs');
const path = require('path');

const workspaceDir = path.join(__dirname, '..', 'archive');

// Helper to sanitize price strings (e.g. "₹2,400" -> 2400)
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

// Maps of incorrect links in contact.html to actual files based on image names
const contactLinkOverrides = {
  'bausch-lomb.html': 'cont4.html',
  'acuvue-30.html': 'cont1.html',
  'acuvue-90.html': 'cont2.html',
  'dailies-aqua.html': 'cont3.html',
  'purevision2.html': 'cont7.html'
};

const products = {};

// 1. Parser for eyeglesses.html (Eyeglasses)
function parseEyeglasses() {
  const filePath = path.join(workspaceDir, 'eyeglesses.html');
  if (!fs.existsSync(filePath)) {
    console.error('eyeglesses.html not found!');
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');

  // Split into sections
  const sections = [
    { id: 'Meneyeglasses', sub: 'men' },
    { id: 'kidseyesglasses', sub: 'kids' },
    { id: 'womeneyeglasses', sub: 'women' },
    { id: 'computereyesglasses', sub: 'computer' }
  ];

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const nextSec = sections[i + 1];
    
    let secContent = '';
    const startIndex = content.indexOf(`id="${sec.id}"`);
    if (startIndex === -1) continue;

    if (nextSec) {
      const endIndex = content.indexOf(`id="${nextSec.id}"`);
      secContent = content.substring(startIndex, endIndex === -1 ? content.length : endIndex);
    } else {
      secContent = content.substring(startIndex);
    }

    // Extract product cards in this section
    // Card regex: <div class="product-card"> ... <a href="productX.html"> ... <img src="productX.png" ...> </a> <h4>Name</h4> <p>Price</p> </div>
    const cardRegex = /<div class="product-card"[\s\S]*?<a href="([^"]+)"[\s\S]*?<img src="([^"]+)"[\s\S]*?<h4>([^<]+)<\/h4>[\s\S]*?<p>([^<]+)<\/p>[\s\S]*?<\/div>/g;
    let match;
    while ((match = cardRegex.exec(secContent)) !== null) {
      let href = match[1].trim();
      const image = match[2].trim();
      const name = match[3].trim();
      const price = parsePrice(match[4].trim());

      // Get standard product ID (e.g. product1, product13.1)
      const productId = path.basename(href, '.html');

      products[productId] = {
        id: productId,
        name,
        price,
        image: image.startsWith('assets/') ? image : 'assets/' + image,
        category: 'eyeglasses',
        subcategory: sec.sub,
        originalFile: href
      };
    }
  }
}

// 2. Parser for sg.html (Sunglasses)
function parseSunglasses() {
  const filePath = path.join(workspaceDir, 'sg.html');
  if (!fs.existsSync(filePath)) {
    console.error('sg.html not found!');
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');

  const sections = [
    { id: 'men-sunglasses', sub: 'men' },
    { id: 'women-sunglasses', sub: 'women' },
    { id: 'icon-sunglasses', sub: 'icon' },
    { id: 'sport-sunglasses', sub: 'sports' }
  ];

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const nextSec = sections[i + 1];
    
    let secContent = '';
    const startIndex = content.indexOf(`id="${sec.id}"`);
    if (startIndex === -1) continue;

    if (nextSec) {
      const endIndex = content.indexOf(`id="${nextSec.id}"`);
      secContent = content.substring(startIndex, endIndex === -1 ? content.length : endIndex);
    } else {
      secContent = content.substring(startIndex);
    }

    const cardRegex = /<div class="product-card"[\s\S]*?<a href="([^"]+)"[\s\S]*?<img src="([^"]+)"[\s\S]*?<h4>([^<]+)<\/h4>[\s\S]*?<p>([^<]+)<\/p>[\s\S]*?<\/div>/g;
    let match;
    while ((match = cardRegex.exec(secContent)) !== null) {
      let href = match[1].trim();
      const image = match[2].trim();
      const name = match[3].trim();
      const price = parsePrice(match[4].trim());

      const productId = path.basename(href, '.html');

      products[productId] = {
        id: productId,
        name,
        price,
        image: image.startsWith('assets/') ? image : 'assets/' + image,
        category: 'sunglasses',
        subcategory: sec.sub,
        originalFile: href
      };
    }
  }
}

// 3. Parser for contact.html (Contact Lenses)
function parseContacts() {
  const filePath = path.join(workspaceDir, 'contact.html');
  if (!fs.existsSync(filePath)) {
    console.error('contact.html not found!');
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');

  const sections = [
    { id: 'daily', sub: 'daily' },
    { id: 'Monthly', sub: 'monthly' },
    { id: 'colored', sub: 'colored' },
    { id: 'lens', sub: 'lens' }
  ];

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const nextSec = sections[i + 1];
    
    let secContent = '';
    const startIndex = content.indexOf(`id="${sec.id}"`);
    if (startIndex === -1) continue;

    if (nextSec) {
      const endIndex = content.indexOf(`id="${nextSec.id}"`);
      secContent = content.substring(startIndex, endIndex === -1 ? content.length : endIndex);
    } else {
      secContent = content.substring(startIndex);
    }

    const cardRegex = /<div class="product-card"[\s\S]*?<a href="([^"]+)"[\s\S]*?<img src="([^"]+)"[\s\S]*?<h4>([^<]+)<\/h4>[\s\S]*?<p>([^<]+)<\/p>[\s\S]*?<\/div>/g;
    let match;
    while ((match = cardRegex.exec(secContent)) !== null) {
      let href = match[1].trim();
      const image = match[2].trim();
      const name = match[3].trim();
      const price = parsePrice(match[4].trim());

      // Resolve incorrect link paths
      let resolvedFile = href;
      if (contactLinkOverrides[href]) {
        resolvedFile = contactLinkOverrides[href];
      }
      
      const productId = path.basename(resolvedFile, '.html');

      products[productId] = {
        id: productId,
        name,
        price,
        image: image.startsWith('assets/') ? image : 'assets/' + image,
        category: 'contacts',
        subcategory: sec.sub,
        originalFile: resolvedFile
      };
    }
  }
}

// 4. Enrich products by loading individual product HTML files
function enrichProducts() {
  console.log(`Enriching ${Object.keys(products).length} parsed products...`);

  for (const id in products) {
    const p = products[id];
    const productFilePath = path.join(workspaceDir, p.originalFile);

    if (!fs.existsSync(productFilePath)) {
      console.warn(`Warning: Individual product page ${p.originalFile} not found for product ${id}`);
      p.desc = `${p.name} - Premium quality ${p.category} from OpticAura.`;
      p.features = ['Premium quality material', 'Comfortable fit', 'Brand warranty'];
      continue;
    }

    const content = fs.readFileSync(productFilePath, 'utf8');

    // Extract description from <div class="descriptions"> <p>...</p>
    const descRegex = /<div class="descriptions"[\s\S]*?<p>([^<]+)<\/p>/i;
    const descMatch = descRegex.exec(content);
    if (descMatch) {
      p.desc = descMatch[1].trim();
    } else {
      p.desc = `${p.name} - Premium quality ${p.category} from OpticAura.`;
    }

    // Extract specs/features list <li>...</li> inside .descriptions
    const features = [];
    const descSectionStart = content.indexOf('class="descriptions"');
    if (descSectionStart !== -1) {
      const descSection = content.substring(descSectionStart, descSectionStart + 1500);
      const liRegex = /<li>([^<]+)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(descSection)) !== null) {
        features.push(liMatch[1].trim());
      }
    }
    p.features = features.length > 0 ? features : ['Premium design', 'Maximum durability', 'Comfortable long-wear design'];
  }
}

// Run parser
parseEyeglasses();
parseSunglasses();
parseContacts();
enrichProducts();

// Output compiled data
const outputFilePath = path.join(__dirname, 'products-db.js');
const jsOutputContent = `// OpticAura Products Database
// Generated dynamically by parse_products.js

const PRODUCTS = ${JSON.stringify(products, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRODUCTS;
}
`;

fs.writeFileSync(outputFilePath, jsOutputContent, 'utf8');
console.log(`Database successfully written to ${outputFilePath}`);
console.log(`Total parsed products: ${Object.keys(products).length}`);
