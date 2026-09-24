"use client";

import React, { useEffect, useState } from "react";
import {
  getContentPlanItems,
  queueContentPlanItem,
  skipContentPlanItem,
  requestKeywordStrategistRun,
} from "@/app/actions/content-plan";
import { Compass, ExternalLink, Loader2, PenLine, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type PlanItem = Awaited<ReturnType<typeof getContentPlanItems>>[number];

const ACTION_LABELS: Record<string, { label: string; className: string }> = {
  NEW_ARTICLE: { label: "Artikel Baru", className: "bg-[#f3d5e3] text-[#a82868]" },
  REFRESH: { label: "Perbarui Artikel", className: "bg-amber-100 text-amber-800" },
  ADD_FAQ_TO_LANDING: { label: "Tambah FAQ Halaman", className: "bg-blue-100 text-blue-800" },
};

const INTENT_LABELS: Record<string, string> = {
  transactional: "Siap pesan",
  commercial: "Menimbang pilihan",
  informational: "Cari info",
};

function statusBadge(item: PlanItem) {
  if (item.status === "queued") return { label: "Sedang ditulis AI", className: "bg-purple-100 text-purple-800" };
  if (item.status === "drafted") {
    return item.post?.isPublished
      ? { label: "Sudah tayang", className: "bg-emerald-100 text-emerald-800" }
      : { label: "Draft siap review", className: "bg-amber-100 text-amber-800" };
  }
  return null;
}

/**
 * Section "Rencana Konten" di /admin/seo -- hasil Agent 5 (Keyword
 * Strategist): cluster keyword berperingkat + aksi yang disarankan.
 * Artikel teratas diantrikan otomatis tiap minggu; tombol di sini untuk
 * mempercepat ("Tulis Sekarang") atau membuang usulan ("Lewati").
 */
export function ContentPlanSection() {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isRequestingRun, setIsRequestingRun] = useState(false);

  const load = async () => {
    setItems(await getContentPlanItems());
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleQueue = async (id: string) => {
    setBusyId(id);
    const result = await queueContentPlanItem(id);
    setBusyId(null);
    if (!result.success) {
      toast.error(result.error || "Gagal mengantrikan artikel.");
      return;
    }
    toast.success("Artikel diantrikan -- Content Writer mulai menulis draft.");
    load();
  };

  const handleSkip = async (id: string) => {
    setBusyId(id);
    const result = await skipContentPlanItem(id);
    setBusyId(null);
    if (!result.success) {
      toast.error(result.error || "Gagal melewati item.");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleRequestRun = async () => {
    setIsRequestingRun(true);
    const result = await requestKeywordStrategistRun();
    setIsRequestingRun(false);
    if (!result.success) {
      toast.error(result.error || "Gagal menjalankan Keyword Strategist.");
      return;
    }
    toast.success("Keyword Strategist dijalankan -- muat ulang halaman ini beberapa menit lagi.");
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#a82868]" />
          <span className="text-xs font-bold text-[#241b18]">Rencana Konten</span>
          <span className="text-[11px] text-[#968b85]">({items.length})</span>
        </div>
        <Button
          onClick={handleRequestRun}
          disabled={isRequestingRun}
          variant="outline"
          className="border-[#f3d5e3] text-[#a82868] hover:bg-[#faf0f4] rounded-full text-xs h-8 px-3 flex items-center gap-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRequestingRun ? "animate-spin" : ""}`} />
          Perbarui Rencana
        </Button>
      </div>
      <p className="text-[11px] text-[#968b85] mb-3">
        Dibuat tiap minggu oleh Agent &quot;Keyword Strategist&quot; dari data Search Console &amp;
        Google Autocomplete. 2 artikel baru teratas diantrikan otomatis; draft tetap perlu kamu
        review sebelum tayang.
      </p>

      <div className="bg-white rounded-[18px] border border-[#f3d5e3]/40 shadow-[0_2px_12px_rgba(168,40,104,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[#968b85] flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-[#a82868]" />
            Memuat rencana konten...
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#968b85]">
            Belum ada rencana konten. Klik &quot;Perbarui Rencana&quot; untuk menjalankan Keyword Strategist.
          </div>
        ) : (
          <div className="divide-y divide-[#f3d5e3]/30">
            {items.map((item) => {
              const action = ACTION_LABELS[item.action] ?? { label: item.action, className: "bg-zinc-100 text-zinc-700" };
              const status = statusBadge(item);
              const isBusy = busyId === item.id;
              return (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm text-[#241b18]">{item.primaryKeyword}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${action.className}`}>
                        {action.label}
                      </span>
                      {status && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.className}`}>
                          {status.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#665b56]">
                      {INTENT_LABELS[item.intent] ?? item.intent} · skor {item.score.toFixed(1)} ·{" "}
                      {item.source === "search_console"
                        ? `${item.impressions} tayang, posisi ${item.position?.toFixed(1) ?? "-"} (90 hari)`
                        : "dari Google Autocomplete"}
                    </p>
                    {item.secondaryKeywords.length > 0 && (
                      <p className="text-[11px] text-[#968b85] truncate">
                        Juga: {item.secondaryKeywords.slice(0, 4).join(", ")}
                      </p>
                    )}
                    {item.post ? (
                      <a
                        href={`/blog/${item.post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#a82868] hover:underline inline-flex items-center gap-1"
                      >
                        {item.post.title}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      item.targetUrl && (
                        <a
                          href={item.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#a82868] hover:underline inline-flex items-center gap-1 break-all"
                        >
                          {item.targetUrl.replace("https://www.falyarisol.com", "") || "/"}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )
                    )}
                  </div>
                  {item.status === "proposed" && (
                    <div className="flex items-center gap-2 shrink-0">
                      {item.action === "NEW_ARTICLE" && (
                        <Button
                          onClick={() => handleQueue(item.id)}
                          disabled={isBusy}
                          className="bg-[#a82868] hover:bg-[#861f53] text-white rounded-full text-xs h-8 px-3 flex items-center gap-1"
                        >
                          <PenLine className="w-3.5 h-3.5" />
                          Tulis Sekarang
                        </Button>
                      )}
                      <Button
                        onClick={() => handleSkip(item.id)}
                        disabled={isBusy}
                        variant="outline"
                        className="border-[#f3d5e3] text-[#665b56] hover:bg-[#faf0f4] rounded-full text-xs h-8 px-3 flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Lewati
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
