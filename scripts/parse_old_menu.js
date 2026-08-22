const fs = require('fs');
const path = require('path');

function parseHtml(htmlPath, defaultCategory = '') {
  const content = fs.readFileSync(htmlPath, 'utf8');
  const items = [];

  // Match menu-item-card divs
  const cardRegex = /<div\s+class="menu-item-card[^"]*"\s+data-id="([^"]+)"\s+data-name="([^"]+)"\s+data-price="([^"]+)"[\s\S]*?<\/div>\s*<\/div>/g;

  // Let's parse category sections
  const sectionRegex = /<div\s+class="menu-category-section"[^>]*data-category-name="([^"]+)"[\s\S]*?<h3>([^<]+)<\/h3>([\s\S]*?)<\/div>\s*(?=<div\s+class="menu-category-section"|<\/div>\s*<\/section>)/g;

  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(content)) !== null) {
    const categoryName = sectionMatch[1];
    const categoryTitle = sectionMatch[2];
    const sectionBody = sectionMatch[3];

    const itemRegex = /<div\s+class="menu-item-card[^"]*"\s+data-id="([^"]+)"\s+data-name="([^"]+)"\s+data-price="([^"]+)"[\s\S]*?<img\s+src="([^"]+)"\s+alt="([^"]*)"[^>]*>[\s\S]*?<h4 class="menu-item-name">([^<]+)<\/h4>[\s\S]*?<p class="menu-item-description">([\s\S]*?)<\/p>[\s\S]*?<p class="menu-item-price">([^<]+)<\/p>/g;

    let itemMatch;
    while ((itemMatch = itemRegex.exec(sectionBody)) !== null) {
      const id = itemMatch[1].trim();
      const dataName = itemMatch[2].trim();
      const price = parseInt(itemMatch[3].trim());
      let img = itemMatch[4].trim().replace(/^\.\//, '/').replace(/^images\//, '/images/');
      if (!img.startsWith('/')) img = '/' + img;
      if (!img.startsWith('/images/')) img = '/images/' + img.replace(/^\//, '');

      const name = itemMatch[6].trim();
      const desc = itemMatch[7].replace(/\s+/g, ' ').trim();
      const displayPrice = itemMatch[8].trim();

      items.push({
        id,
        name,
        category: categoryName,
        categoryTitle,
        price,
        displayPrice,
        description: desc,
        image: img
      });
    }
  }

  return items;
}

const menuItems = parseHtml('c:/Users/LENOVO/Documents/designs/FALYA/Websites/Website 2025/V2/menu.html');
const liwetItems = parseHtml('c:/Users/LENOVO/Documents/designs/FALYA/Websites/Website 2025/V2/nasi-liwet.html');
const snackboxItems = parseHtml('c:/Users/LENOVO/Documents/designs/FALYA/Websites/Website 2025/V2/snackbox.html');

console.log('Menu items count:', menuItems.length);
console.log('Liwet items count:', liwetItems.length);
console.log('Snackbox items count:', snackboxItems.length);

const all = [...menuItems, ...liwetItems, ...snackboxItems];
console.log('Total items across old website:', all.length);

fs.writeFileSync('scripts/parsed_old_menu.json', JSON.stringify({
  menuItems,
  liwetItems,
  snackboxItems,
  all
}, null, 2));

console.log('Saved to scripts/parsed_old_menu.json');
