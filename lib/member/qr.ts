import QRCode from "qrcode";

/**
 * QR kartu member sebagai SVG (dibuat di server; CSP situs melarang skrip QR
 * dari CDN). Warna & koreksi error mengikuti desain kartu-member-falya.html.
 */
export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: "#1B120C", light: "#FFFFFF" },
  });
}

/** Data URI untuk <img> di ImageResponse (OG image & unduhan kartu). */
export async function qrDataUri(text: string): Promise<string> {
  const svg = await qrSvg(text);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
