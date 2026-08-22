const fs = require("fs");
const path = require("path");
const data = require("./parsed_old_menu.json");

// Map category to unit
function getUnit(category) {
  if (category === "risol" || category === "snack") return "pcs";
  if (category === "coffee" || category === "juices-drinks") return "cup";
  if (category === "liwet-tampah" || category === "kue-nampan") return "paket";
  if (category.startsWith("snackbox")) return "box";
  if (category.startsWith("liwet") || category === "kuliner") return "porsi";
  return "porsi";
}

const items = data.all.map((item) => {
  // Handle fallback image if missing
  let img = item.image;
  if (item.id === "sbmini003") {
    img = "/images/snackbox/min01.webp";
  }

  // Popular items
  const popularIds = [
    "risol001",
    "risol004",
    "kuliner003",
    "sbreg001",
    "tampah001",
    "snack004",
    "juice001",
    "coffee007",
  ];
  const isPopular = popularIds.includes(item.id);

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    description: item.description,
    image: img,
    isPopular: isPopular,
    isAvailable: true,
    unit: getUnit(item.category),
  };
});

const fileContent = `export interface MenuItem {
  id: string;
  name: string;
  category: 
    | 'risol' 
    | 'snack' 
    | 'kuliner' 
    | 'coffee' 
    | 'juices-drinks' 
    | 'liwet-ayam' 
    | 'liwet-nila' 
    | 'liwet-tampah' 
    | 'snackbox-mini' 
    | 'snackbox-reguler' 
    | 'snackbox-komplit' 
    | 'kue-nampan';
  price: number;
  description: string;
  image: string;
  isPopular?: boolean;
  isAvailable: boolean;
  unit?: string;
}

export const INITIAL_MENU: MenuItem[] = ${JSON.stringify(items, null, 2)};

export const MENU_CATEGORIES = [
  { id: 'semua', label: 'Semua' },
  { id: 'risol', label: 'Risol' },
  { id: 'snack', label: 'Snack' },
  { id: 'kuliner', label: 'Kuliner' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'juices-drinks', label: 'Juices & Drinks' },
] as const;

export const LIWET_CATEGORIES = [
  { id: 'semua', label: 'Semua Paket' },
  { id: 'liwet-ayam', label: 'Paket Nasi Liwet Ayam (Kotak)' },
  { id: 'liwet-nila', label: 'Paket Nasi Liwet Nila (Kotak)' },
  { id: 'liwet-tampah', label: 'Paket Nasi Liwet Tampah' },
] as const;

export const SNACKBOX_CATEGORIES = [
  { id: 'semua', label: 'Semua Paket' },
  { id: 'snackbox-mini', label: 'Snack Box Mini' },
  { id: 'snackbox-reguler', label: 'Snack Box Reguler' },
  { id: 'snackbox-komplit', label: 'Snack Box Komplit' },
  { id: 'kue-nampan', label: 'Paket Kue Nampan' },
] as const;

export const FALYA_CONTACT = {
  phone: '085954227622',
  whatsappNumber: '6285954227622',
  instagram: '@falya_risol',
  facebook: 'falyarisol',
  address: 'Jl. Syarifuddin Yoes no.4 RT 41, Balikpapan Selatan',
  hours: 'Senin - Minggu: 08:00 - 18:00 WITA',
  googleMapsUrl: 'https://maps.app.goo.gl/falya',
};
`;

fs.writeFileSync("lib/data/menuData.ts", fileContent, "utf8");
console.log(
  "Successfully generated lib/data/menuData.ts with " +
    items.length +
    " items!",
);
