"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HistoryEntry, MemberDashboardData } from "@/lib/member/dashboard";
import styles from "./member.module.css";

const LOGO = "/images/member/falya-logo.png";
const ADMIN_WA = "https://wa.me/6285954227622?text=Halo%20Admin%20Falya%2C%20saya%20mau%20tanya%20soal%20poin%20member.";

const LABEL: Record<string, string> = {
  EARN_SPEND: "Poin belanja",
  DAILY_BONUS: "Poin harian",
  WELCOME: "Bonus member baru",
  REDEEM: "Tukar hadiah",
  REDEEM_REVERSAL: "Penukaran dibatalkan",
  EARN_SPEND_REVERSAL: "Poin belanja ditarik",
  DAILY_BONUS_REVERSAL: "Poin harian ditarik",
  EXPIRE: "Poin hangus",
  ADJUST: "Koreksi poin",
  MERGE_IN: "Gabung akun",
  MERGE_OUT: "Gabung akun",
};

const nf = new Intl.NumberFormat("id-ID");
const dLong = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Makassar" });
const dDay = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Makassar" });
const tHM = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" });
/** Tanggal/jam dari server sudah WITA tanpa offset. */
const wita = (s: string) => new Date(s + (s.length === 10 ? "T00:00:00+08:00" : "+08:00"));
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const Icon = {
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>,
  gift: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z" /></svg>,
  minus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>,
  sun: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg>,
  spark: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><circle cx="12" cy="12" r="2.5" /></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  alert: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>,
  down: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" /></svg>,
  chevron: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>,
};

type Chip = { kind: "ok" | "info" | "warn"; icon: React.ReactNode; body: React.ReactNode };

export default function MemberDashboard({ initial, qrSvg }: { initial: MemberDashboardData; qrSvg: string }) {
  const [d, setD] = useState(initial);
  const [gone, setGone] = useState(false);
  const [stale, setStale] = useState(false);
  const [front, setFront] = useState(false);
  const [histLimit, setHistLimit] = useState(8);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Penyegaran berkala selama halaman terlihat (Page Visibility API); berhenti saat tab tidak aktif
  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/m/${initial.token}`, { cache: "no-store" });
      if (r.status === 404) {
        setGone(true);
        return;
      }
      if (!r.ok) {
        setStale(true);
        return;
      }
      setD((await r.json()) as MemberDashboardData);
      setStale(false);
    } catch {
      setStale(true);
    }
  }, [initial.token]);

  useEffect(() => {
    const ms = Math.max(5, d.pollSeconds || 10) * 1000;
    const start = () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(refresh, ms);
    };
    const stop = () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        refresh();
        start();
      }
    };
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh, d.pollSeconds]);

  if (gone) return <CardNotFound />;

  const bal = d.balance;
  const next = d.tiers.find((t) => t.points > bal);
  const top = d.tiers[d.tiers.length - 1];
  const target = next ? next.points : top?.points ?? Math.max(bal, 1);
  const pct = Math.max(0, Math.min(100, (bal / target) * 100));
  const first = d.name.split(" ")[0];
  const r = d.rules;

  const chips: Chip[] = [];
  if (bal < 0)
    chips.push({ kind: "warn", icon: Icon.alert, body: <>Saldo minus karena ada pesanan yang dikembalikan. Poin akan pulih otomatis dari belanja berikutnya; penukaran hadiah dibuka lagi setelah saldo positif.</> });
  if (bal >= d.maxBalance)
    chips.push({ kind: "warn", icon: Icon.alert, body: <><b>Poin Kakak sudah maksimal.</b> Tukarkan dulu supaya poin berikutnya tetap terhitung.</> });
  chips.push(
    d.dailyBonusToday
      ? { kind: "ok", icon: Icon.check, body: <><b>Poin harian hari ini sudah didapat.</b> Datang lagi besok untuk +{d.dailyBonus} poin.</> }
      : { kind: "info", icon: Icon.sun, body: <>Belanja minimal Rp{nf.format(d.dailyMinIdr)} hari ini untuk <b>+{d.dailyBonus} poin harian</b>.</> }
  );
  if (d.doublePointToday) chips.push({ kind: "info", icon: Icon.spark, body: <><b>Hari ini Double Poin Day!</b> Poin belanja dan poin harian dikali {r.doublePointMultiplier}.</> });
  else if (d.nextDoublePointDate) chips.push({ kind: "info", icon: Icon.spark, body: <><b>Double Poin Day</b> berikutnya: {dDay.format(wita(d.nextDoublePointDate))}.</> });
  chips.push({ kind: "info", icon: Icon.clock, body: <>Poin berlaku sampai {dLong.format(wita(d.expiresAt))}. Setiap transaksi memperpanjang masa berlaku.</> });

  const lb = d.leaderboard;

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.topIn}>
          <a href="https://www.falyarisol.com" aria-label="Falya Risol Mayo, ke beranda">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Falya Risol Mayo" />
          </a>
          <div className={styles.live} aria-live="polite">
            <span className={`${styles.dot} ${stale ? styles.dotStale : ""}`} aria-hidden="true" />
            <span>{stale ? "Menunggu koneksi…" : `Diperbarui ${tHM.format(wita(d.updatedAt))}`}</span>
          </div>
        </div>
      </header>

      <div className={styles.wrap}>
        {/* Kolom kiri: kartu & saldo */}
        <div className={`${styles.col} ${styles.side}`}>
          <div>
            <p className={styles.eyebrow}>Member Falya</p>
            <h1>Halo, {first}</h1>
            <p className={styles.sub}>Poin bertambah otomatis setiap belanja lunas.</p>
          </div>

          <section aria-label="Kartu member">
            <div className={styles.scene}>
              <button
                className={`${styles.card} ${front ? styles.isFront : ""}`}
                type="button"
                aria-label="Kartu member. Ketuk untuk membalik."
                onClick={() => setFront((f) => !f)}
              >
                <div className={`${styles.face} ${styles.back}`}>
                  <div className={`${styles.cRow} ${styles.cTop}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={LOGO} alt="" />
                    <span className={styles.cBadge}>MEMBER CARD</span>
                  </div>
                  <div className={`${styles.cRow} ${styles.cMid}`}>
                    <div className={styles.cInfo}>
                      <div>
                        <p className={styles.cLabel}>Nama</p>
                        <p className={`${styles.cName} ${d.name.length > 22 ? styles.cNameLong : ""}`}>{d.name}</p>
                      </div>
                      <div>
                        <p className={styles.cLabel}>No. Member</p>
                        <p className={styles.cNum}>{d.memberNumber}</p>
                      </div>
                    </div>
                    <div className={styles.cQrWrap}>
                      <div className={styles.cQr} role="img" aria-label="QR kartu member" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                      <p className={styles.cCap}>Scan untuk cek poin &amp; hadiah</p>
                    </div>
                  </div>
                  <div className={`${styles.cRow} ${styles.cBottom}`}>
                    <p>Tunjukkan kartu ini ke kasir saat belanja</p>
                    <p>falyarisol.com</p>
                  </div>
                </div>
                <div className={`${styles.face} ${styles.front}`} aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={LOGO} alt="" />
                </div>
              </button>
            </div>
            <div className={styles.cardActions}>
              <a className={`${styles.btn} ${styles.btnPrimary}`} href={`/api/m/${d.token}/card.png`} download>
                {Icon.down}
                Simpan kartu
              </a>
              <button className={`${styles.btn} ${styles.btnGhost}`} type="button" onClick={() => setFront((f) => !f)}>
                Balik kartu
              </button>
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="h-saldo">
            <h2 id="h-saldo" className={styles.eyebrow} style={{ fontSize: 12 }}>Saldo poin</h2>
            <p className={styles.balance}>
              <strong>{nf.format(bal)}</strong>
              <span>poin</span>
            </p>
            <div className={styles.bar} role="progressbar" aria-valuemin={0} aria-valuemax={target} aria-valuenow={Math.max(bal, 0)}>
              <i style={{ width: `${pct}%` }} />
            </div>
            <p className={styles.next}>
              {next ? (
                <>Tinggal <b>{nf.format(next.points - Math.max(bal, 0))} poin</b> lagi ke {lc(next.reward)}.</>
              ) : (
                <>Semua hadiah sudah bisa ditukar. Tukarkan di kasir kapan saja.</>
              )}
            </p>
            <div className={styles.status}>
              {chips.map((c, i) => (
                <div key={i} className={`${styles.chip} ${c.kind === "ok" ? styles.chipOk : c.kind === "warn" ? styles.chipWarn : styles.chipInfo}`}>
                  {c.icon}
                  <span>{c.body}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Kolom kanan */}
        <div className={styles.col}>
          <section className={styles.panel} aria-labelledby="h-hadiah">
            <div className={styles.panelHead}>
              <h2 id="h-hadiah">Hadiah</h2>
              <p>Tukar di kasir</p>
            </div>
            <ul className={styles.tiers}>
              {d.tiers.map((t) => {
                const ready = bal >= t.points;
                const p = Math.max(0, Math.min(100, (bal / t.points) * 100));
                return (
                  <li key={t.points + t.reward} className={`${styles.tier} ${ready ? styles.tierReady : ""}`}>
                    <div className={styles.tierPts}>
                      {nf.format(t.points)}
                      <small>poin</small>
                    </div>
                    <div className={styles.tierBody}>
                      <p className={styles.tierReward}>{t.reward}</p>
                      <p className={styles.tierState}>{ready ? "Bisa ditukar sekarang" : `Kurang ${nf.format(t.points - Math.max(bal, 0))} poin`}</p>
                      {!ready && (
                        <div className={styles.mini} aria-hidden="true">
                          <i style={{ width: `${p}%` }} />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className={styles.redeemNote}>
              Tunjukkan kartu ini ke kasir saat belanja, atau minta penukaran lewat chat WhatsApp untuk pesanan antar.{" "}
              {r.maxRedeemPerTrx === 1 ? "Satu penukaran per transaksi." : `Maksimal ${r.maxRedeemPerTrx} penukaran per transaksi.`}
            </p>
          </section>

          <section className={styles.panel} aria-labelledby="h-rank">
            <div className={styles.panelHead}>
              <h2 id="h-rank">Peringkat</h2>
              <p>{d.quarter}</p>
            </div>
            <div className={styles.ranks}>
              {lb.eligible ? (
                <>
                  <div className={styles.rank}>
                    <p className={styles.rankLabel}>Top Spender</p>
                    <p className={styles.rankVal}>{lb.spenderRank ? `#${lb.spenderRank}` : "–"}</p>
                    <p className={styles.rankSub}>Top 3 dapat hadiah</p>
                  </div>
                  <div className={styles.rank}>
                    <p className={styles.rankLabel}>Paling Rajin</p>
                    <p className={styles.rankVal}>{lb.diligentRank ? `#${lb.diligentRank}` : "–"}</p>
                    <p className={styles.rankSub}>{lb.diligentDays} hari belanja</p>
                  </div>
                </>
              ) : (
                <p className={styles.rankSub} style={{ gridColumn: "1/-1", margin: 0 }}>Peringkat tidak berlaku untuk jenis akun ini.</p>
              )}
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="h-hist">
            <div className={styles.panelHead}>
              <h2 id="h-hist">Riwayat poin</h2>
            </div>
            <History items={d.history} limit={histLimit} />
            {d.history.length > histLimit && (
              <button className={`${styles.btn} ${styles.btnGhost} ${styles.more}`} type="button" onClick={() => setHistLimit((n) => n + 10)}>
                Lihat riwayat lainnya
              </button>
            )}
          </section>

          <section className={styles.panel} aria-labelledby="h-rules">
            <div className={styles.panelHead}>
              <h2 id="h-rules">Aturan main</h2>
            </div>
            <details open>
              <summary>Cara dapat poin{Icon.chevron}</summary>
              <div className={styles.rules}>
                <ul>
                  <li><b>Poin belanja:</b> 1 poin setiap Rp{nf.format(r.spendRateIdr)} yang dibayar, maksimal {nf.format(r.maxSpendPointsPerTrx)} poin per transaksi.</li>
                  <li><b>Poin harian:</b> +{r.dailyBonus} poin sekali sehari untuk belanja minimal Rp{nf.format(r.dailyMinIdr)}.</li>
                  <li>Berlaku untuk makan di tempat, bawa pulang, dan pesan antar via WhatsApp. Pastikan kasir mencatat nomor member Kakak.</li>
                  <li>Poin masuk begitu pembayaran lunas.</li>
                  <li><b>Double Poin Day:</b> poin belanja dan poin harian dikali {r.doublePointMultiplier} di tanggal tertentu.</li>
                </ul>
              </div>
            </details>
            <details>
              <summary>Daftar hadiah{Icon.chevron}</summary>
              <div className={styles.rules}>
                <div className={styles.tblWrap}>
                  <table>
                    <thead>
                      <tr><th>Poin</th><th>Hadiah</th></tr>
                    </thead>
                    <tbody>
                      {d.tiers.map((t) => (
                        <tr key={t.points + t.reward}>
                          <td className={styles.num}>{nf.format(t.points)}</td>
                          <td>{t.reward}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
            <details>
              <summary>Syarat &amp; ketentuan{Icon.chevron}</summary>
              <div className={styles.rules}>
                <ul>
                  <li>Poin hangus seluruhnya jika tidak ada transaksi selama {r.expiryMonths} bulan. Setiap transaksi memperpanjang masa berlaku.</li>
                  <li>Saldo maksimal {nf.format(r.maxBalance)} poin. Tukarkan poin agar poin berikutnya tetap terhitung.</li>
                  <li>Hadiah tidak dapat diuangkan, tidak ada kembalian, dan tidak dapat dipindahkan ke member lain.</li>
                  <li>Jika pesanan dibatalkan atau dikembalikan, poin dari pesanan tersebut ikut ditarik.</li>
                  <li>Satu nomor WhatsApp untuk satu member. Kartu ini pribadi; jangan bagikan link-nya.</li>
                  <li>Top 3 Top Spender dan Top 3 Paling Rajin diumumkan setiap akhir kuartal.</li>
                </ul>
              </div>
            </details>
          </section>
        </div>
      </div>

      <footer className={styles.footer}>
        <span>© {new Date(d.updatedAt + "+08:00").getFullYear()} Falya Risol Mayo · Balikpapan</span>
        <a href={ADMIN_WA} rel="noopener">Tanya admin via WhatsApp</a>
      </footer>
    </div>
  );
}

function History({ items, limit }: { items: HistoryEntry[]; limit: number }) {
  if (items.length === 0) return <p className={styles.empty}>Belum ada riwayat poin.</p>;
  const rows: React.ReactNode[] = [];
  let lastDay = "";
  for (const [i, h] of items.slice(0, limit).entries()) {
    const dt = wita(h.at);
    const key = dLong.format(dt);
    if (key !== lastDay) {
      rows.push(<li key={`d${i}`} className={styles.day}>{dDay.format(dt)}</li>);
      lastDay = key;
    }
    const plus = h.points >= 0;
    rows.push(
      <li key={i} className={`${styles.hrow} ${plus ? styles.plus : styles.minus}`}>
        <span className={styles.hicon}>{h.type === "REDEEM" ? Icon.gift : plus ? Icon.plus : Icon.minus}</span>
        <div className={styles.htext}>
          <p className={styles.hlabel}>{LABEL[h.type] ?? "Perubahan poin"}</p>
          <p className={styles.hsub}>{h.note} · {tHM.format(dt)}</p>
        </div>
        <span className={styles.hpts}>{plus ? "+" : "−"}{nf.format(Math.abs(h.points))}</span>
      </li>
    );
  }
  return <ol className={styles.hist}>{rows}</ol>;
}

export function CardNotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.notice}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Falya Risol Mayo" />
        <h1>Kartu tidak ditemukan</h1>
        <p>Link kartu ini tidak berlaku. Minta kasir Falya mengirim ulang kartu member Kakak lewat WhatsApp.</p>
        <a className={`${styles.btn} ${styles.btnPrimary}`} href={ADMIN_WA} rel="noopener">Tanya admin via WhatsApp</a>
      </div>
    </div>
  );
}
