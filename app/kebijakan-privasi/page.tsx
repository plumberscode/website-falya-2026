import type { Metadata } from "next";
import { FALYA_CONTACT } from "@/lib/data/menuData";

export const metadata: Metadata = {
  title: "Kebijakan Privasi Aplikasi Falya Hub | Falya Risol Mayo",
  description:
    "Kebijakan privasi aplikasi Android Falya Hub: data apa yang diproses, tujuan, pihak ketiga, dan cara meminta penghapusan data.",
  alternates: { canonical: "https://www.falyarisol.com/kebijakan-privasi" },
  robots: { index: true, follow: true },
};

const DATA_ROWS = [
  ["Nama, alamat email, dan peran akun", "Karyawan & pemilik", "Login (email/kata sandi atau Google Sign-In) dan pengaturan hak akses."],
  ["Data absensi, jadwal, gaji, kasbon", "Karyawan", "Pencatatan kehadiran dan perhitungan penggajian."],
  ["Nama dan nomor telepon member", "Pelanggan, dicatat oleh kasir", "Program poin & hadiah member."],
  ["Transaksi, pesanan, stok produk", "Operasional toko", "Pencatatan penjualan, dapur, dan laporan omzet."],
  ["Token notifikasi perangkat (Firebase Cloud Messaging)", "Perangkat pengguna", "Mengirim notifikasi operasional (pesanan, pengumuman)."],
];

export default function KebijakanPrivasiPage() {
  return (
    <div className="w-full bg-[#fdfbfc] text-[#241b18] min-h-screen pt-28 pb-20">
      <article className="max-w-[800px] mx-auto px-4 sm:px-6 space-y-8 leading-relaxed">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#a82868]">
            Kebijakan Privasi Falya Hub
          </h1>
          <p className="text-sm text-[#665b56]">Berlaku sejak 10 November 2026</p>
        </header>

        <p>
          Falya Hub adalah aplikasi Android untuk operasional internal usaha Falya Risol Mayo:
          kasir, dapur, absensi, penggajian, dan program poin member. Aplikasi hanya dapat
          digunakan oleh pemilik dan karyawan yang akunnya dibuat oleh pemilik usaha. Halaman
          ini menjelaskan data apa yang diproses aplikasi, untuk apa, dan bagaimana data
          dilindungi.
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">1. Data yang kami proses</h2>
          <div className="overflow-x-auto rounded-xl border border-[#ebd7c0] bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f7ebdd]">
                <tr>
                  <th className="p-3 font-semibold">Data</th>
                  <th className="p-3 font-semibold">Dari siapa</th>
                  <th className="p-3 font-semibold">Tujuan</th>
                </tr>
              </thead>
              <tbody>
                {DATA_ROWS.map(([data, who, why]) => (
                  <tr key={data} className="border-t border-[#f0e4d6] align-top">
                    <td className="p-3">{data}</td>
                    <td className="p-3">{who}</td>
                    <td className="p-3">{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">2. Lokasi</h2>
          <p>
            Saat karyawan melakukan absensi, aplikasi membaca lokasi perangkat untuk memastikan
            karyawan berada di area toko. Pengecekan jarak dilakukan <strong>di perangkat</strong>;
            koordinat lokasi tidak dikirim ke atau disimpan di server kami. Lokasi tidak dibaca di
            latar belakang.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">3. Bluetooth</h2>
          <p>
            Izin Bluetooth hanya dipakai untuk terhubung ke printer struk thermal yang sudah
            dipasangkan (paired). Aplikasi tidak memindai atau mengumpulkan data perangkat
            Bluetooth lain.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">4. Penyimpanan dan pihak ketiga</h2>
          <p>
            Data disimpan di layanan basis data Supabase dan dikirim melalui koneksi terenkripsi
            (HTTPS). Layanan pihak ketiga yang digunakan, masing-masing dengan kebijakan privasinya
            sendiri:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Supabase — penyimpanan data dan autentikasi</li>
            <li>Google Sign-In dan Firebase Cloud Messaging (Google LLC) — login dan notifikasi</li>
            <li>
              Google Play services (pemindai kode) — memindai QR kartu member; gambar kamera
              diproses di perangkat dan tidak disimpan
            </li>
          </ul>
          <p>
            Kami tidak menjual data, tidak menampilkan iklan, dan tidak membagikan data kepada
            pihak lain selain penyedia layanan di atas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">5. Penyimpanan dan penghapusan data</h2>
          <p>
            Data disimpan selama diperlukan untuk operasional usaha dan kewajiban pencatatan.
            Karyawan atau member dapat meminta akses, koreksi, atau penghapusan data pribadinya
            melalui kontak di bawah. Permintaan diproses paling lambat 30 hari.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">6. Anak-anak</h2>
          <p>Aplikasi ini ditujukan untuk karyawan dewasa dan tidak ditujukan untuk anak-anak.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">7. Perubahan kebijakan</h2>
          <p>Perubahan akan dipublikasikan di halaman ini dengan tanggal berlaku yang diperbarui.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">8. Kontak</h2>
          <p>
            Falya Risol Mayo — {FALYA_CONTACT.address}.
            <br />
            WhatsApp:{" "}
            <a
              className="text-[#a82868] underline"
              href={`https://wa.me/${FALYA_CONTACT.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {FALYA_CONTACT.phone}
            </a>
          </p>
        </section>
      </article>
    </div>
  );
}
