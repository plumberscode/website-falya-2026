// Single source of truth untuk testimoni Google Maps — dipakai oleh
// TestimonialSlider.tsx (render UI) dan lib/seo/reviewJsonLd.ts (Review
// schema di LocalBusiness), supaya keduanya tidak bisa mismatch satu sama
// lain. Pola sama seperti SNACKBOX_FAQ / KUE_NAMPAN_FAQ.
export interface Testimonial {
  id: string;
  name: string;
  avatarType: "image" | "initial";
  avatarSrc?: string;
  avatarInitial?: string;
  avatarBg?: string;
  isLocalGuide?: boolean;
  userStats: string;
  timeAgo: string;
  rating: number;
  text: string;
  orderType?: string;
  pricePerPerson?: string;
  scores?: {
    food?: number;
    service?: number;
    atmosphere?: number;
  };
  attributes?: {
    noiseLevel?: string;
    waitTime?: string;
  };
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "ajeng",
    name: "Ajeng Dwiyani",
    avatarType: "image",
    avatarSrc: "/images/reviews/avatar-ajeng.png",
    isLocalGuide: true,
    userStats: "Local Guide · 36 reviews · 23 photos",
    timeAgo: "1 tahun lalu",
    rating: 5,
    text: "Makanannya enak enak.. pilihan menunya terbatas tapi oke semua.. ga cuma risolnya yg recommended, lalapannya enak juga. Ada bagian belakang yang cozy, kalau bagian depan seperti resto simple biasanya",
    pricePerPerson: "Rp 25–50K",
    scores: {
      food: 5,
      service: 5,
      atmosphere: 4,
    },
    attributes: {
      noiseLevel: "Quiet, easy to talk",
      waitTime: "No wait",
    },
  },
  {
    id: "endang",
    name: "Endang Aviyanti",
    avatarType: "image",
    avatarSrc: "/images/reviews/avatar-endang.png",
    userStats: "1 review",
    timeAgo: "2 bulan lalu",
    rating: 5,
    text: "Risol langganan mantab\nUtk maksi juga enak...soto dagingnya oke..ayam kremesnya juga",
    orderType: "Delivery",
    scores: {
      food: 5,
      service: 5,
    },
  },
  {
    id: "kartika",
    name: "Kartika Puspasari",
    avatarType: "initial",
    avatarInitial: "K",
    avatarBg: "bg-[#5f6368]",
    userStats: "6 reviews",
    timeAgo: "2 bulan lalu",
    rating: 5,
    text: "Selalu puas dengan pelayanan Falya Risol,,admin Fast Respon dan makanan baik snack ataupun nasi liwet dan soto daging nya enak. Belum pernah makan di tempat selalu pesan antar next mau coba untuk makan di tempat.",
    orderType: "Delivery",
  },
  {
    id: "nayla",
    name: "Nayla Maharani",
    avatarType: "initial",
    avatarInitial: "N",
    avatarBg: "bg-[#673ab7]",
    userStats: "1 review",
    timeAgo: "1 bulan lalu",
    rating: 5,
    text: "Seneng bgt jajan di siniii!!! Sgt worth the priceee dari segi rasa, porsi dan tentunya kebersihan!!! Sukak jajannn falyaa kalo udah ngerasa mager masak wkwkwkwk pilihan praktis dan tepat kalau lagi mager 💕💕💕",
    orderType: "Take out",
    scores: {
      food: 5,
      service: 5,
      atmosphere: 5,
    },
  },
  {
    id: "novita",
    name: "Novita Triwahyuni",
    avatarType: "image",
    avatarSrc: "/images/reviews/avatar-novita.png",
    userStats: "6 reviews",
    timeAgo: "1 bulan lalu",
    rating: 5,
    text: "Nasi liwetnya juara umum se balikpapan. Ayam kremesnya favorit keluarga. Menu andalan kalau malas masak.",
    orderType: "Delivery",
    pricePerPerson: "Rp 25–50K",
    attributes: {
      noiseLevel: "Quiet, easy to talk",
    },
  },
];
