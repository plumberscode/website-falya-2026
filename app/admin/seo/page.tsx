"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSeoAuditReports, getPendingSeoFixes, approveSeoFix, rejectSeoFix } from "@/app/actions/seo";
import { logoutAction } from "@/app/actions/auth";
import {
  LogOut,
  Loader2,
  Link2Off,
  Tags,
  Gauge,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AdminTabs } from "@/components/admin/admin-tabs";

// Shape reportJson -- serialisasi apa adanya dari SeoAuditReport (Pydantic,
// Karyawan AI/src/falya_crew/models.py). Longgar (bukan tipe ketat) karena
// ini data JSON mentah, cuma dipakai untuk render detail.
interface SeoReportJson {
  crawl?: {
    pages_crawled?: number;
    broken_links?: { url: string; status_code: number | null; error: string | null }[];
    meta_issues?: { page_url: string; issue_type: string; detail: string }[];
    sitemap_diff?: { missing_from_sitemap?: string[] };
  };
  pagespeed?: {
    scores?: { url: string; performance_score: number | null; seo_score: number | null }[];
  };
  search_console?: {
    total_clicks: number;
    total_impressions: number;
    top_queries?: { query: string; clicks: number; impressions: number; position: number }[];
  } | null;
}

interface SeoAuditReportRow {
  id: string;
  generatedAt: Date;
  websiteBaseUrl: string;
  totalBrokenLinks: number;
  totalMetaIssues: number;
  avgPerformanceScore: number | null;
  totalClicks28d: number | null;
  totalImpressions28d: number | null;
  reportJson: unknown;
}

interface PendingFixRow {
  id: string;
  field: string;
  currentValue: string | null;
  proposedValue: string;
  post: { id: string; title: string; slug: string } | null;
}

function performanceBadgeClass(score: number | null) {
  if (score === null) return "bg-zinc-100 text-zinc-600";
  if (score >= 90) return "bg-emerald-100 text-emerald-800";
  if (score >= 50) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

export default function AdminSeoPage() {
  const router = useRouter();
  const [reports, setReports] = useState<SeoAuditReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingFixes, setPendingFixes] = useState<PendingFixRow[]>([]);
  const [isLoadingFixes, setIsLoadingFixes] = useState(true);
  const [decidingFixId, setDecidingFixId] = useState<string | null>(null);

  const loadPendingFixes = async () => {
    const data = await getPendingSeoFixes();
    setPendingFixes(data as PendingFixRow[]);
    setIsLoadingFixes(false);
  };

  useEffect(() => {
    // Muat laporan & fix pending sekali di mount -- tidak ada cara lain
    // mengetahui data server tanpa efek ini.
    (async () => {
      const data = await getSeoAuditReports();
      setReports(data as SeoAuditReportRow[]);
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPendingFixes();
  }, []);

  const handleApproveFix = async (id: string) => {
    setDecidingFixId(id);
    const result = await approveSeoFix(id);
    setDecidingFixId(null);
    if (!result.success) {
      toast.error(result.error || "Gagal menerapkan fix.");
      return;
    }
    toast.success("Fix diterapkan ke artikel.");
    setPendingFixes((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRejectFix = async (id: string) => {
    setDecidingFixId(id);
    const result = await rejectSeoFix(id);
    setDecidingFixId(null);
    if (!result.success) {
      toast.error(result.error || "Gagal menolak fix.");
      return;
    }
    toast.info("Usulan fix ditolak.");
    setPendingFixes((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="w-full bg-[#fdfbfc] text-[#241b18] min-h-screen pt-28 pb-20">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#f3d5e3]/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#f3d5e3] text-[#a82868] font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                ADMIN CONTROL
              </span>
              <span className="text-xs text-[#665b56]">Audit Teknis SEO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241b18]">
              Laporan Audit SEO
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={async () => {
                await logoutAction();
                toast.success("Berhasil logout");
                router.push("/admin/login");
              }}
              variant="ghost"
              className="text-[#c74343] hover:bg-red-50 text-xs rounded-full flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>

        <AdminTabs active="seo" counts={{ seo: reports.length }} />

        <p className="text-xs text-[#968b85] mb-6">
          Laporan ini dibuat otomatis tiap minggu oleh Agent &quot;SEO Auditor&quot;
          (crew Python, <code>python -m falya_crew.seo_audit</code>) -- audit-only,
          belum ada perubahan otomatis ke website.
        </p>

        {/* Fix Diusulkan -- HANYA untuk meta description artikel blog yang
            kosong, satu-satunya isu yang punya nilai fallback aman
            (cleanExcerpt). Butuh approval eksplisit sebelum diterapkan. */}
        {!isLoadingFixes && pendingFixes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-[#241b18]">Fix Diusulkan</span>
              <span className="text-[11px] text-[#968b85]">({pendingFixes.length})</span>
            </div>
            <div className="space-y-3 mb-2">
              {pendingFixes.map((fix) => (
                <div
                  key={fix.id}
                  className="bg-white rounded-[18px] p-4 sm:p-5 border border-amber-200/60 shadow-[0_2px_12px_rgba(245,158,11,0.06)]"
                >
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-sm text-[#241b18] truncate">
                        {fix.post?.title ?? "(artikel tidak ditemukan)"}
                      </span>
                      {fix.post && (
                        <a
                          href={`/blog/${fix.post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#968b85] hover:text-[#a82868] transition shrink-0"
                          title="Lihat artikel"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full shrink-0">
                        Meta Description Kosong
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        onClick={() => handleApproveFix(fix.id)}
                        disabled={decidingFixId === fix.id}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs h-8 px-3 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Terapkan
                      </Button>
                      <Button
                        onClick={() => handleRejectFix(fix.id)}
                        disabled={decidingFixId === fix.id}
                        variant="outline"
                        className="border-[#f3d5e3] text-[#665b56] hover:bg-[#faf0f4] rounded-full text-xs h-8 px-3 flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Tolak
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs space-y-1.5">
                    <p className="text-[#968b85]">
                      Saat ini: <span className="italic">{fix.currentValue?.trim() || "(kosong)"}</span>
                    </p>
                    <p className="text-[#241b18] bg-emerald-50 border border-emerald-200/60 rounded-lg px-3 py-2">
                      Usulan: {fix.proposedValue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Listing */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(168,40,104,0.05)] border border-[#f3d5e3]/40">
          {isLoading ? (
            <div className="p-16 text-center text-[#968b85] flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#a82868]" />
              <p className="text-xs">Memuat laporan dari database Neon...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-16 text-center text-[#968b85] space-y-1">
              <p className="text-sm font-semibold text-[#241b18]">
                Belum ada laporan audit SEO.
              </p>
              <p className="text-xs">
                Jalankan <code>python -m falya_crew.seo_audit</code> dari folder
                Karyawan AI untuk audit pertama.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f3d5e3]/20">
              {reports.map((report) => {
                const isExpanded = expandedId === report.id;
                const detail = report.reportJson as SeoReportJson;
                const generatedDate = new Date(report.generatedAt);

                return (
                  <div key={report.id} className="p-5">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-bold text-sm text-[#241b18]">
                            {generatedDate.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[11px] text-[#968b85]">
                            {generatedDate.toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              report.totalBrokenLinks > 0
                                ? "bg-red-100 text-red-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            <Link2Off className="w-3 h-3" />
                            {report.totalBrokenLinks} Broken Link
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            <Tags className="w-3 h-3" />
                            {report.totalMetaIssues} Isu Meta Tag
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${performanceBadgeClass(
                              report.avgPerformanceScore
                            )}`}
                          >
                            <Gauge className="w-3 h-3" />
                            Performance{" "}
                            {report.avgPerformanceScore !== null
                              ? Math.round(report.avgPerformanceScore)
                              : "N/A"}
                          </span>
                          {report.totalClicks28d !== null && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                              {report.totalClicks28d} klik / {report.totalImpressions28d} tayang (28 hari)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-[#968b85]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#f3d5e3]/40 space-y-4 text-xs">
                        <div>
                          <p className="font-bold text-[#241b18] mb-1.5">
                            Broken Link ({detail.crawl?.broken_links?.length ?? 0})
                          </p>
                          {detail.crawl?.broken_links?.length ? (
                            <ul className="space-y-1 text-[#665b56]">
                              {detail.crawl.broken_links.map((b, i) => (
                                <li key={i} className="break-all">
                                  {b.url} -- {b.status_code ?? b.error ?? "error tidak diketahui"}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[#968b85]">Tidak ada broken link ditemukan.</p>
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-[#241b18] mb-1.5">
                            Isu Meta Tag ({detail.crawl?.meta_issues?.length ?? 0})
                          </p>
                          {detail.crawl?.meta_issues?.length ? (
                            <ul className="space-y-1 text-[#665b56]">
                              {detail.crawl.meta_issues.map((issue, i) => (
                                <li key={i} className="break-all">
                                  <span className="font-semibold">{issue.issue_type}</span> -- {issue.page_url}
                                  {issue.detail ? `: ${issue.detail}` : ""}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[#968b85]">Tidak ada isu meta tag.</p>
                          )}
                        </div>

                        {!!detail.crawl?.sitemap_diff?.missing_from_sitemap?.length && (
                          <div>
                            <p className="font-bold text-[#241b18] mb-1.5">Route Hilang dari Sitemap</p>
                            <p className="text-[#665b56]">
                              {detail.crawl.sitemap_diff.missing_from_sitemap.join(", ")}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="font-bold text-[#241b18] mb-1.5">Skor Page Speed</p>
                          {detail.pagespeed?.scores?.length ? (
                            <ul className="space-y-1 text-[#665b56]">
                              {detail.pagespeed.scores.map((s, i) => (
                                <li key={i} className="break-all">
                                  {s.url} -- Performance {s.performance_score ?? "N/A"}, SEO {s.seo_score ?? "N/A"}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[#968b85]">Tidak ada data page speed.</p>
                          )}
                        </div>

                        {detail.search_console?.top_queries?.length ? (
                          <div>
                            <p className="font-bold text-[#241b18] mb-1.5">Top Queries (Search Console)</p>
                            <ul className="space-y-1 text-[#665b56]">
                              {detail.search_console.top_queries.slice(0, 10).map((q, i) => (
                                <li key={i}>
                                  &quot;{q.query}&quot; -- {q.clicks} klik / {q.impressions} tayang, posisi rata-rata {q.position}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-[#968b85]">
                            Data Search Console belum tersedia (belum di-setup, lihat README Karyawan AI).
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
