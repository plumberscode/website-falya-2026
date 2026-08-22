<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- Design Guidelines -->

## UI Design System & Agent Guidelines

**Version 1.0**

> **Purpose:** Menjadi sumber kebenaran visual dan UX untuk seluruh proses redesign website Falya Risol Mayo.

---

# 01. DESIGN NORTH STAR

### Brand feeling

Website Falya harus terasa:

> **Hangat, friendly, premium, tetapi tetap terasa dekat.**

Komposisi visual:

```text
60% Modern Premium
30% Warm
10% Playful
```

### Core principle

> **Food First. Brand Second. Decoration Third.**

Prioritas visual:

```text
1. Makanan
2. Informasi produk
3. CTA / conversion
4. Brand
5. Falya & Lili
6. Decorative elements
```

Jangan membiarkan ilustrasi, animasi, atau dekorasi mengalahkan foto makanan.

---

# 02. DESIGN PERSONALITY

### DO

- clean
- warm
- premium
- inviting
- rounded
- spacious
- appetizing
- modern
- friendly

### DON'T

- terlalu ramai
- terlalu childish
- terlalu corporate
- terlalu minimal sampai terasa dingin
- terlalu banyak gradient
- terlalu banyak shadow
- terlalu banyak animasi
- desain seperti marketplace
- desain seperti warung murah
- desain seperti coffee shop hipster

---

# 03. COLOR SYSTEM

Gunakan **Falya magenta** sebagai primary brand color, bukan sebagai warna background utama seluruh website.

### Brand

```css
--color-primary: #a82868;
--color-primary-dark: #861f53;
--color-primary-light: #f3d5e3;
```

### Warm Neutral

```css
--color-background: #fffdf9;
--color-surface: #ffffff;
--color-surface-warm: #fff8ef;

--color-cream: #f7ebdd;
--color-cream-dark: #ebd7c0;
```

### Text

```css
--color-text: #241b18;
--color-text-secondary: #665b56;
--color-text-muted: #968b85;
```

### Food / Accent

Gunakan secara terbatas:

```css
--color-food-orange: #e67e22;
--color-food-gold: #f7b733;
--color-chili: #e53935;
```

### Semantic

```css
--color-success: #3e7c59;
--color-warning: #c58a27;
--color-error: #c74343;
```

### Color rule

**Primary magenta bukan untuk semuanya.**

Gunakan:

- CTA
- active states
- important highlights
- badges
- character accessories
- selected category

Jangan membuat seluruh section menjadi magenta.

---

# 04. BACKGROUND STRATEGY

Default website:

> **Warm White**

```css
background: #fffdf9;
```

Gunakan variasi background untuk menciptakan rhythm.

Contoh:

```text
Hero
↓
Warm White

Best Seller
↓
White

Snack Box
↓
Warm Cream

Nasi Liwet
↓
White

CTA
↓
Primary / Warm Cream
```

Hindari setiap section memiliki background berbeda-beda secara agresif.

---

# 05. TYPOGRAPHY

Personality:

> **Friendly Rounded**

Typography harus terasa modern dan friendly, tetapi tetap mudah dibaca.

### Hierarchy

```text
Display
H1
H2
H3
Body Large
Body
Body Small
Caption
Price
Button
```

Recommended scale:

```css
Display: 64–80px
H1:      48–64px
H2:      36–44px
H3:      24–30px
Body L:  18–20px
Body:    16px
Body S:  14px
Caption: 12–13px
```

### Mobile

```text
Display: 40–48px
H1:      36–42px
H2:      28–34px
H3:      22–26px
Body:    16px
```

### Typography rule

**Jangan menggunakan terlalu banyak font.**

Ideal:

```text
1 display/headline family
1 body family
```

Jika satu font family mampu memenuhi semuanya, gunakan satu family.

---

# 06. FONT WEIGHT

```text
Regular    → body
Medium     → supporting text
Semibold   → labels / product name
Bold       → headings
ExtraBold  → hero emphasis / price
```

Hindari menggunakan ExtraBold untuk seluruh website.

---

# 07. SPACING SYSTEM

Gunakan sistem spacing konsisten.

```text
4
8
12
16
20
24
32
40
48
64
80
96
120
```

### Component spacing

```text
Icon → text           8–12px
Card internal padding 16–24px
Button padding        12–16px
Card → card           16–24px
Section content       48–80px
Major section         80–120px
```

### Golden rule

> **Lebih baik terlalu banyak whitespace daripada terlalu banyak elemen.**

---

# 08. LAYOUT CONTAINER

Desktop:

```css
max-width: 1200px;
margin-inline: auto;
padding-inline: 24px;
```

Large desktop dapat berkembang hingga:

```text
1280–1360px
```

Tetapi jangan membuat content terlalu lebar.

Food photography membutuhkan ruang bernapas.

---

# 09. GRID SYSTEM

### Desktop

12-column conceptual grid.

### Tablet

8-column.

### Mobile

4-column.

Agent tidak harus membuat CSS grid literal 12-column untuk setiap section.

Yang penting adalah:

> **alignment harus konsisten.**

Headline, image, card dan CTA harus memiliki visual alignment yang jelas.

---

# 10. BORDER RADIUS

Brand personality menggunakan rounded corners.

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 18px;
--radius-xl: 24px;
--radius-pill: 999px;
```

### Usage

```text
Buttons       → pill / 12px
Product card  → 18–24px
Image         → 18–24px
Input         → 12–16px
Badge         → pill
Modal         → 24px
```

Jangan membuat seluruh UI berbentuk pill.

---

# 11. SHADOW SYSTEM

Shadow harus **soft dan subtle**.

```css
--shadow-sm: 0 2px 8px rgba(36, 27, 24, 0.06);

--shadow-md: 0 8px 24px rgba(36, 27, 24, 0.08);

--shadow-lg: 0 16px 40px rgba(36, 27, 24, 0.12);
```

Food cards sebaiknya menggunakan shadow yang sangat ringan.

Premium ≠ floating everything.

---

# 12. BUTTON SYSTEM

## Primary CTA

```text
[ Pesan Sekarang ]
```

Style:

```text
background: Primary
text: white
rounded: pill
weight: semibold
```

Primary CTA harus paling menonjol.

---

## Secondary CTA

```text
[ Lihat Menu ]
```

Gunakan:

- white / transparent
- border primary
- primary text

---

## Tertiary

Untuk action kecil:

```text
Lihat Selengkapnya →
```

Tidak perlu button box.

---

# 13. BUTTON HIERARCHY

Dalam satu section:

```text
1 Primary CTA
1 Secondary CTA
optional tertiary
```

Jangan:

```text
[Pesan]
[Lihat]
[Beli]
[Chat]
[Selengkapnya]
[Info]
```

semuanya terlihat sama penting.

---

# 14. PRODUCT CARD

Ini adalah salah satu komponen terpenting website.

### Desktop

```text
┌──────────────────────────┐
│                          │
│       PRODUCT PHOTO      │
│                          │
├──────────────────────────┤
│ Risol Mayo               │
│ Creamy mayo + ...        │
│                          │
│ Rp 7.000                 │
│                          │
│ [ Tambah ke Keranjang ]  │
└──────────────────────────┘
```

### Rules

Product card wajib:

- menggunakan **foto asli**
- memiliki harga
- memiliki nama produk
- memiliki CTA
- tidak terlalu banyak teks
- memiliki visual hierarchy jelas

### Best Seller

Gunakan badge kecil:

> **BEST SELLER**

Jangan badge besar yang menutupi makanan.

---

# 15. PRODUCT IMAGE

Ini sangat penting untuk Falya.

### Source of truth

> **Foto asli produk adalah sumber kebenaran produk.**

AI-generated imagery tidak boleh mengubah bentuk makanan.

Untuk Risol Mayo:

- triangular
- golden-orange
- breadcrumb coating
- crispy texture
- creamy mayo filling
- smoked beef
- egg
- red chili sauce

Jika menggunakan AI untuk environment:

> produk harus tetap identik dengan reference image.

---

# 16. PRODUCT CARD IMAGE RATIO

Default:

```text
4:3
```

atau:

```text
1:1
```

Pilih satu secara konsisten dalam satu product system.

Untuk Falya saya lebih merekomendasikan:

> **4:3**

karena memberikan ruang cukup untuk makanan tanpa membuat card terlalu tinggi.

---

# 17. BEST SELLER COMPONENT

Homepage menampilkan:

### BEST SELLER

```text
Risol Mayo
Risol Mozza
Nasi Liwet Ayam Bakar
```

Gunakan 3 produk utama.

Jangan menampilkan 10 produk sebagai "Best Seller".

---

# 18. CATEGORY COMPONENT

Kategori utama:

```text
Risol
Nasi Liwet
Snack Box
Lunch Box
```

Category card harus lebih sederhana daripada product card.

Contoh:

```text
┌────────────────────┐
│                    │
│       IMAGE        │
│                    │
├────────────────────┤
│ Risol              │
│ Lihat Menu →       │
└────────────────────┘
```

---

# 19. SNACK BOX COMPONENT

Snack Box adalah **business priority**, jadi jangan dibuat seperti kategori biasa.

Section harus terasa seperti:

> **Falya bisa membantu kebutuhan acara kamu.**

Visual:

```text
SNACK BOX
Untuk meeting, acara,
kantor & berbagai kebutuhan.

[ Lihat Paket Snack Box ]
```

Fokus conversion, bukan sekadar katalog.

---

# 20. CORPORATE CTA

Gunakan section khusus:

> **Ada acara atau kebutuhan konsumsi kantor?**

Supporting copy:

> Snack Box dan Lunch Box Falya siap untuk berbagai kebutuhan acara.

CTA:

> **Konsultasi via WhatsApp**

Ini harus terasa sangat mudah.

---

# 21. NAVIGATION

### Desktop

```text
FALYA LOGO

Home
Menu
Snack Box
Nasi Liwet

                    Cart
              [ Pesan Sekarang ]
```

Navbar:

- clean
- sticky
- subtle backdrop
- tidak terlalu tinggi

### Sticky behavior

Saat scroll:

```text
navbar height ↓
background → solid / translucent
shadow → subtle
```

---

# 22. MOBILE NAVIGATION

Mobile adalah prioritas.

Header:

```text
☰    FALYA LOGO    🛒
```

Bottom CTA:

```text
┌────────────────────────────┐
│ 🛒  Pesan Sekarang         │
└────────────────────────────┘
```

Sticky bottom CTA hanya jika tidak mengganggu cart/checkout.

---

# 23. CART

Cart harus terasa seperti bagian natural dari website, bukan sistem ecommerce yang berat.

Cart drawer:

```text
Keranjang Kamu

Risol Mayo       x2
Risol Mozza      x1
Nasi Liwet       x2

Subtotal
Rp xxx.xxx

[ Checkout ]
```

Jangan memaksa visitor pindah halaman hanya untuk melihat cart.

---

# 24. CHECKOUT

Checkout harus sederhana.

Prioritas:

```text
Customer
↓
Order
↓
Delivery / pickup
↓
Confirmation
↓
WhatsApp
```

Jangan membuat checkout terlalu kompleks untuk bisnis makanan lokal.

---

# 25. WHATSAPP

WhatsApp adalah **primary conversion channel**.

Tetapi jangan membuat website terasa seperti WhatsApp landing page.

Website:

> membangun kepercayaan + membantu memilih.

WhatsApp:

> menyelesaikan transaksi / komunikasi.

CTA copy:

> **Pesan via WhatsApp**

lebih baik daripada:

> **Klik di sini**

---

# 26. HERO SYSTEM

Hero merupakan komponen paling branded.

Current concept:

```text
Gedung Falya
↓
Falya menggoreng Risol
↓
Risol diangkat
↓
Risol hangat disajikan
↓
Saus merah
```

Hero harus membuat visitor berpikir:

> **“Wah, risolnya kelihatan enak.”**

bukan:

> “Wah animasinya keren.”

---

# 27. HERO TYPOGRAPHY

Headline pendek.

Contoh direction:

> **Risol Renyah, Bikin Nagih.**

Supporting:

> Risol Mayo, Nasi Liwet, dan berbagai pilihan untuk menemani hari dan acara kamu.

CTA:

```text
[ Pesan Sekarang ]
[ Lihat Menu ]
```

Jangan membuat headline terlalu panjang.

---

# 28. FALYA & LILI SYSTEM

Falya dan Lili adalah **UI characters**, bukan dekorasi random.

### Falya

Gunakan ketika konteksnya:

- Risol
- cooking
- excitement
- welcoming
- product recommendation

### Lili

Gunakan ketika konteksnya:

- Nasi Liwet
- mature/calm messaging
- playful reaction
- supporting story

---

# 29. CHARACTER SCALE

Default:

> Character jangan lebih besar daripada hero food/product ketika keduanya muncul bersama.

Hierarchy:

```text
Food
↓
Headline
↓
CTA
↓
Character
```

Pengecualian:

> Hero storytelling.

Di hero, karakter boleh menjadi focal point karena memang bagian dari narrative.

---

# 30. CHARACTER UI USAGE

Good:

```text
        Falya
          ↓
   "Ini favoritku!"
          ↓
      Product
```

Bad:

```text
Falya
Falya
Falya
Falya
Falya
```

Jangan menggunakan karakter di setiap section.

---

# 31. ILLUSTRATION STYLE

Falya & Lili:

> **3D stylized / cute / premium**

UI lainnya:

> **clean modern UI**

Jangan membuat seluruh website menjadi cartoon.

---

# 32. PHOTOGRAPHY STYLE

Food photography:

> appetizing + realistic + warm.

Lighting:

- warm natural
- soft directional light
- subtle highlights
- realistic texture
- shallow depth of field bila sesuai

Hindari:

- over-saturated orange
- artificial plastic food
- excessive glow
- fake steam yang berlebihan
- unrealistic ingredients

---

# 33. FOOD VISUAL RULE

Untuk semua generated/edit visual:

> **Never invent product characteristics.**

Agent harus menggunakan reference image.

Jika reference tidak tersedia:

> **Do not guess.**

Gunakan placeholder atau minta reference.

Ini penting karena sebelumnya AI sempat menghasilkan makanan yang bentuknya tidak sesuai produk asli.

---

# 34. SECTION HEADING

Format:

```text
EYEBROW
BEST SELLER

H2
Favorit yang Selalu Dicari

Supporting text
Pilihan favorit pelanggan Falya.
```

Eyebrow bisa menggunakan:

```text
uppercase
small
semibold
primary
```

Jangan terlalu banyak decorative heading.

---

# 35. SECTION WIDTH

Text heading jangan terlalu panjang.

Ideal:

```text
max-width: 600–700px
```

Body:

```text
max-width: 600px
```

Ini menjaga readability dan premium feel.

---

# 36. SECTION RHYTHM

Homepage jangan terlihat seperti kumpulan card.

Gunakan pergantian:

```text
Hero
↓
Product grid
↓
Editorial image section
↓
Product
↓
Character story
↓
Snackbox
↓
CTA
```

**Editorial composition** harus digunakan untuk membuat website terasa premium.

---

# 37. ANIMATION SYSTEM

Animation personality:

> **smooth, warm, confident**

Durasi umum:

```text
Fast:   150–200ms
Normal: 250–400ms
Large:  500–800ms
```

Easing:

> ease-out / spring ringan

Gunakan animation untuk:

- reveal
- hover
- product interaction
- cart
- hero storytelling

Jangan menggunakan animation untuk sekadar membuat semua elemen bergerak.

---

# 38. SCROLL REVEAL

Default:

```text
opacity: 0 → 1
translateY: 20px → 0
```

Subtle.

Jangan:

```text
rotate
bounce
zoom
spin
```

semuanya sekaligus.

---

# 39. ACCESSIBILITY

Minimum:

- contrast cukup
- button memiliki label jelas
- image memiliki alt
- keyboard accessible
- focus state
- touch target minimal sekitar 44px
- tidak bergantung pada warna saja
- reduced motion support

---

# 40. RESPONSIVE RULE

### Mobile

Prioritas:

```text
Food
Price
CTA
```

### Tablet

Gunakan intermediate layout.

### Desktop

Boleh menggunakan:

- large imagery
- split layout
- editorial composition
- larger whitespace

Tetapi jangan membuat desktop terasa seperti website berbeda.

---

# 41. MOBILE PRODUCT GRID

Recommended:

```text
2 columns
```

bukan satu produk per baris.

Card harus tetap cukup besar untuk melihat makanan.

---

# 42. DESKTOP PRODUCT GRID

Recommended:

```text
3 columns
```

untuk best sellers.

Full menu dapat:

```text
3–4 columns
```

tergantung ukuran card.

---

# 43. ICONOGRAPHY

Icon style:

> simple rounded line icons.

Contoh:

- cart
- search
- location
- WhatsApp
- arrow
- menu

Jangan mencampur:

- outline icons
- filled icons
- cartoon icons
- 3D icons

dalam satu UI.

---

# 44. BADGES

Gunakan badge hanya untuk informasi penting:

```text
BEST SELLER
NEW
POPULAR
```

Maximum visual prominence:

> small.

Badge bukan headline.

---

# 45. INPUT SYSTEM

Input:

```text
height: 48–52px
border: 1px
radius: 12–16px
background: white
```

Focus:

```text
border → primary
```

Placeholder menggunakan muted text.

---

# 46. EMPTY STATES

Karena brand memiliki karakter, empty state boleh menggunakan Falya/Lili.

Contoh cart kosong:

> **Keranjang masih kosong nih.**

Falya kecil:

> **Yuk pilih risol dulu!**

CTA:

> **Lihat Menu**

Ini salah satu tempat yang bagus untuk playful element.

---

# 47. ERROR STATES

Tone tetap friendly.

Jangan:

> Error 500.

Lebih baik:

> **Oops, ada yang belum beres.**

CTA:

> **Coba Lagi**

Tetapi jangan mengorbankan kejelasan teknis jika error membutuhkan informasi lebih lanjut.

---

# 48. LOADING

Gunakan skeleton sederhana.

Jangan menggunakan animasi karakter untuk setiap loading state.

Food card:

```text
[ image skeleton ]

████████
██████

████
```

---

# 49. FOOTER

Footer harus sederhana.

```text
FALYA RISOL MAYO

Menu
Snack Box
Nasi Liwet
Contact

WhatsApp
Instagram
Location

© Falya Risol Mayo
```

Jangan membuat footer menjadi sitemap raksasa.

---

# 50. SEO UI

SEO content harus tetap mengikuti desain.

Jangan membuat:

```text
Risol Balikpapan
Risol Mayo Balikpapan
Snack Box Balikpapan
Snack Box Murah Balikpapan
Nasi Liwet Balikpapan
```

sebagai kumpulan keyword yang terlihat dipaksakan.

Gunakan natural language.

---

# 51. AGENT IMPLEMENTATION RULES

Ini bagian yang paling penting untuk agent.

### RULE 01

**Do not invent a new visual style.**

Seluruh UI harus mengikuti design system ini.

### RULE 02

**Do not change brand colors without explicit approval.**

### RULE 03

**Do not change product appearance.**

Gunakan foto/reference asli.

### RULE 04

**Do not create fake product imagery.**

Jika produk tidak memiliki reference:

> gunakan placeholder.

### RULE 05

**Price must always be visible on product cards.**

### RULE 06

**Primary CTA must be obvious.**

### RULE 07

**Mobile first.**

### RULE 08

**Do not overuse Falya & Lili.**

### RULE 09

**Do not over-animate.**

### RULE 10

**Do not sacrifice performance for visual effects.**

### RULE 11

**Do not create unnecessary components.**

Reuse existing design-system components.

### RULE 12

**Maintain consistent spacing and typography.**

### RULE 13

**Do not redesign the checkout flow without explicit approval.**

Target flow tetap:

```text
Product
→ Cart
→ Checkout
→ WhatsApp/Admin
```

### RULE 14

**Every page must have a clear primary conversion goal.**

### RULE 15

Jika ada keputusan desain yang tidak tercakup dalam guideline:

> **Pilih solusi yang paling sederhana, premium, warm, dan conversion-oriented.**

---

# 52. AGENT DECISION PRIORITY

Jika agent harus memilih antara dua solusi desain:

```text
1. Conversion
2. Product clarity
3. Brand consistency
4. Accessibility
5. Performance
6. Visual beauty
7. Decorative complexity
```

Dengan kata lain:

> **Jangan memilih desain yang lebih keren jika desain tersebut membuat produk atau CTA lebih sulit ditemukan.**

---

# 53. COMPONENT ARCHITECTURE

Agent sebaiknya berpikir dalam hierarchy:

```text
DESIGN TOKENS
    ↓
PRIMITIVES
    ↓
COMPONENTS
    ↓
SECTIONS
    ↓
PAGES
```

Contoh:

```text
Color Token
    ↓
Button
    ↓
Product Card
    ↓
Best Seller Section
    ↓
Home Page
```

Jangan membuat setiap page memiliki styling sendiri-sendiri.

---

# 54. REUSABILITY

Komponen yang sama harus terlihat sama.

Contoh:

Jika `ProductCard` digunakan di:

- Homepage
- Menu
- Search
- Category

maka visualnya tetap konsisten.

Variasi hanya jika memang dibutuhkan:

```text
ProductCard
ProductCardCompact
ProductCardFeatured
```

bukan membuat 5 versi berbeda tanpa alasan.

---

# 55. DESIGN QA CHECKLIST

Sebelum agent menyatakan halaman selesai:

### Brand

- [ ] Terasa premium
- [ ] Tetap warm
- [ ] Tetap friendly
- [ ] Tidak terasa seperti warung
- [ ] Tidak terlalu childish

### Product

- [ ] Foto asli/reference digunakan
- [ ] Produk tidak berubah bentuk
- [ ] Harga terlihat
- [ ] Product name jelas
- [ ] CTA jelas

### UX

- [ ] Visitor tahu harus melakukan apa
- [ ] Menu mudah ditemukan
- [ ] Cart mudah ditemukan
- [ ] WhatsApp mudah ditemukan
- [ ] Mobile experience baik

### Visual

- [ ] Whitespace cukup
- [ ] Typography konsisten
- [ ] Border radius konsisten
- [ ] Shadow tidak berlebihan
- [ ] Color system konsisten

### Motion

- [ ] Animasi tidak berlebihan
- [ ] Tidak mengganggu reading
- [ ] Tidak mengganggu CTA
- [ ] Reduced motion dipertimbangkan

---

# 56. MASTER DIRECTIVE UNTUK AGENT

Saya sarankan bagian ini **langsung ditempatkan di awal instruction/project context agent**:

> **You are designing the new Falya Risol Mayo website. Treat this UI Design System as the single source of truth for visual design and UX decisions.**
>
> The website must feel **60% modern premium, 30% warm, and 10% playful**. The brand should feel **warm, friendly, premium, yet approachable**.
>
> Falya is primarily an **online food ordering and delivery business**, followed by a comfortable dine-in experience. The website's primary conversion goal is increasing online orders and WhatsApp conversations.
>
> **Food is always the visual priority.** Use authentic product photography as the source of truth. Never invent or alter the shape, texture, filling, color, portion, or characteristics of Falya's actual food products.
>
> Falya and Lili are important brand characters, but they must support the product and storytelling rather than overpower food photography.
>
> Always prioritize:
>
> **Conversion → Product clarity → Brand consistency → Accessibility → Performance → Decoration.**
>
> The main customer journey is:
>
> **Product → Cart → Checkout → WhatsApp/Admin**
>
> Product cards must always show the **product name, authentic product image, price, and clear purchase CTA**.
>
> The website is **mobile-first**.
>
> Avoid visual styles that feel cheap, overly warung-like, childish, overly corporate, overly decorative, or excessively animated.
>
> When a design decision is not explicitly specified, choose the solution that is **simple, premium, warm, friendly, accessible, performant, and conversion-oriented**.
>
> **Do not introduce new colors, typography styles, component patterns, animation styles, or product representations without maintaining consistency with this design system.**
>
> If an actual product reference image is unavailable, **do not guess the product appearance**. Use a placeholder or request the correct reference.
