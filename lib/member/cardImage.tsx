import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cardUrl } from "./dashboard";
import { qrDataUri } from "./qr";

export const CARD_SIZE = { width: 1200, height: 630 };

let logoCache: Promise<string> | null = null;
function logoDataUri(): Promise<string> {
  logoCache ??= readFile(join(process.cwd(), "public/images/member/falya-logo.png")).then(
    (buf) => `data:image/png;base64,${buf.toString("base64")}`
  );
  return logoCache;
}

/**
 * Sisi belakang kartu member (nama, nomor, QR) 1200×630 — sama dengan
 * kartu-member-falya.html. Dipakai OG image WhatsApp dan unduhan PNG.
 * Kartu tidak ditemukan -> kartu generik tanpa data member.
 */
export async function renderMemberCard(
  member: { name: string; memberNumber: string; token: string } | null,
  init?: ResponseInit
): Promise<ImageResponse> {
  const logo = await logoDataUri();
  const u = CARD_SIZE.width / 100; // 1 cqw di desain = 12px

  if (!member) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #B5306F 0%, #8E2058 45%, #4A0F2E 100%)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={46 * u} height={(46 * u * 378) / 771} alt="" />
        </div>
      ),
      { ...CARD_SIZE, ...init }
    );
  }

  const qr = await qrDataUri(cardUrl(member.token));
  const longName = member.name.length > 22;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#2B1B12",
          color: "#F6EEDC",
          padding: 5.3 * u,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={22 * u} height={(22 * u * 378) / 771} alt="" />
          <div style={{ display: "flex", fontSize: 1.75 * u, fontWeight: 600, letterSpacing: "0.32em", color: "#E07AA8", marginTop: 0.6 * u }}>
            MEMBER CARD
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 4 * u }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2.6 * u, flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 1.9 * u, fontWeight: 500, color: "#BFA98F", marginBottom: 0.5 * u }}>Nama</div>
              <div style={{ display: "flex", fontSize: (longName ? 3.1 : 4.2) * u, fontWeight: 600, lineHeight: 1.15 }}>{member.name}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 1.9 * u, fontWeight: 500, color: "#BFA98F", marginBottom: 0.5 * u }}>No. Member</div>
              <div style={{ display: "flex", fontSize: 4.6 * u, fontWeight: 700, letterSpacing: "0.14em" }}>{member.memberNumber}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.2 * u }}>
            <div
              style={{
                display: "flex",
                width: 18.3 * u,
                height: 18.3 * u,
                background: "#FFFFFF",
                borderRadius: 1.4 * u,
                padding: 1.3 * u,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} width={15.7 * u} height={15.7 * u} alt="" />
            </div>
            <div style={{ display: "flex", fontSize: 1.75 * u }}>Scan untuk cek poin &amp; hadiah</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(191,169,143,.45)",
            paddingTop: 1.6 * u,
            fontSize: 1.8 * u,
          }}
        >
          <div style={{ display: "flex" }}>Tunjukkan kartu ini ke kasir saat belanja</div>
          <div style={{ display: "flex" }}>falyarisol.com</div>
        </div>
      </div>
    ),
    { ...CARD_SIZE, ...init }
  );
}
