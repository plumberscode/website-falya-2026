"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getLatestRunPerAgent,
  getAgentRunLogs,
  getBestsellers,
  getApprovalQueueCounts,
  getSeoSummary,
  getContentSummary,
  getCostSummary,
  createAgentTaskRequest,
  getPendingAgentTask,
  getRoadmapNotes,
  createRoadmapNote,
  toggleRoadmapNote,
  deleteRoadmapNote,
  type AgentName,
  type TaskableAgentName,
} from "@/app/actions/agents";
import { requestContentJob, getPendingContentJob } from "@/app/actions/content";
import { logoutAction } from "@/app/actions/auth";
import {
  LogOut,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  CircleDashed,
  AlertTriangle,
  Wand2,
  FileText,
  Link2Off,
  Tags,
  Gauge,
  BookOpen,
  DollarSign,
  Send,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AdminTabs } from "@/components/admin/admin-tabs";

interface RunLogRow {
  id: string;
  agentName: string;
  status: string;
  summary: string | null;
  errorMessage: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCostUsd: number | null;
  startedAt: Date;
  finishedAt: Date | null;
}

interface RoadmapNoteRow {
  id: string;
  text: string;
  done: boolean;
  createdAt: Date;
}

interface BestsellerRow {
  id: string;
  name: string;
  price: number;
  unit: string | null;
}

interface SeoSummaryRow {
  id: string;
  generatedAt: Date;
  totalBrokenLinks: number;
  totalMetaIssues: number;
  avgPerformanceScore: number | null;
}

function performanceBadgeClass(score: number | null) {
  if (score === null) return "bg-zinc-100 text-zinc-600";
  if (score >= 90) return "bg-emerald-100 text-emerald-800";
  if (score >= 50) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

interface CostLogRow {
  agentName: string;
  estimatedCostUsd: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  startedAt: Date;
}

interface CostGroup {
  agentName: string;
  monthKey: string; // "YYYY-MM"
  totalCostUsd: number;
  totalTokens: number;
  runCount: number;
}

/** Group per agent+bulan CLIENT-SIDE (bukan Prisma groupBy) -- cadence run
 * manual/jarang, dataset kecil, tidak perlu agregasi di database. */
function groupCostByAgentMonth(rows: CostLogRow[]): CostGroup[] {
  const map = new Map<string, CostGroup>();
  for (const row of rows) {
    const d = new Date(row.startedAt);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const key = `${row.agentName}|${monthKey}`;
    const existing = map.get(key) ?? {
      agentName: row.agentName,
      monthKey,
      totalCostUsd: 0,
      totalTokens: 0,
      runCount: 0,
    };
    existing.totalCostUsd += row.estimatedCostUsd ?? 0;
    existing.totalTokens += (row.inputTokens ?? 0) + (row.outputTokens ?? 0);
    existing.runCount += 1;
    map.set(key, existing);
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.monthKey !== b.monthKey) return b.monthKey.localeCompare(a.monthKey);
    return a.agentName.localeCompare(b.agentName);
  });
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

const AGENT_LABELS: Record<AgentName, string> = {
  sales_sync: "Sales Sync",
  seo_audit: "SEO Auditor",
  content_writer: "Content Writer",
  keyword_strategist: "Keyword Strategist",
};

const AGENT_COMMANDS: Record<AgentName, string> = {
  sales_sync: "python -m falya_crew",
  seo_audit: "python -m falya_crew.seo_audit",
  content_writer: "python -m falya_crew.content_writer",
  keyword_strategist: "python -m falya_crew.keyword_strategist",
};

const AGENT_ORDER: AgentName[] = ["sales_sync", "seo_audit", "keyword_strategist", "content_writer"];

function formatDateTime(date: Date | string) {
  const d = new Date(date);
  return `${d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}, ${d.toLocaleTimeString(
    "id-ID",
    { hour: "2-digit", minute: "2-digit" }
  )}`;
}

/** Extract angka dari prefix "UNMATCHED:<n>" di AgentRunLog.summary -- lihat
 * get_last_sync_summary() di Karyawan AI/src/falya_crew/tools/website_sync_tool.py. */
function parseUnmatchedCount(summary: string | null): number | null {
  if (!summary) return null;
  const match = summary.match(/^UNMATCHED:(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function StatusPill({ status }: { status: string }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" />
        Sukses
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" />
        Error
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
        <Clock className="w-3 h-3" />
        Sedang Jalan
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
      <CircleDashed className="w-3 h-3" />
      Belum Pernah Jalan
    </span>
  );
}

export default function AdminAgentsPage() {
  const router = useRouter();

  const [latestRuns, setLatestRuns] = useState<Record<AgentName, RunLogRow | null> | null>(null);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);

  const [bestsellers, setBestsellers] = useState<BestsellerRow[]>([]);
  const [isLoadingBestsellers, setIsLoadingBestsellers] = useState(true);

  const [approvalCounts, setApprovalCounts] = useState({ pendingSeoFixes: 0, draftPosts: 0 });
  const [isLoadingApproval, setIsLoadingApproval] = useState(true);

  const [seoSummary, setSeoSummary] = useState<SeoSummaryRow | null>(null);
  const [contentSummary, setContentSummary] = useState({ publishedThisMonth: 0, drafts: 0 });
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const [costGroups, setCostGroups] = useState<CostGroup[]>([]);
  const [isLoadingCost, setIsLoadingCost] = useState(true);

  const [expandedAgent, setExpandedAgent] = useState<AgentName | null>(null);
  const [history, setHistory] = useState<RunLogRow[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Section 3: Instruksi -- sales_sync & seo_audit pakai AgentTaskRequest
  // (baru), content_writer tetap pakai ContentJobRequest yang sudah ada
  // (requestContentJob/getPendingContentJob), tidak digabung.
  const [pendingTasks, setPendingTasks] = useState<
    Record<TaskableAgentName, { id: string; instruction?: string | null } | null>
  >({
    sales_sync: null,
    seo_audit: null,
  });
  const [pendingContentJob, setPendingContentJob] = useState<{ id: string; instruction?: string | null } | null>(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [openInstructionFor, setOpenInstructionFor] = useState<TaskableAgentName | null>(null);
  const [instructionDrafts, setInstructionDrafts] = useState<Record<TaskableAgentName, string>>({
    sales_sync: "",
    seo_audit: "",
  });
  const [isContentInstructionOpen, setIsContentInstructionOpen] = useState(false);
  const [contentInstructionDraft, setContentInstructionDraft] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState<AgentName | null>(null);

  // Section 6: Planning/roadmap -- catatan manual admin, bukan hasil agent.
  const [roadmapNotes, setRoadmapNotes] = useState<RoadmapNoteRow[]>([]);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(true);
  const [newRoadmapText, setNewRoadmapText] = useState("");
  const [isAddingRoadmapNote, setIsAddingRoadmapNote] = useState(false);

  const loadRoadmapNotes = useCallback(async () => {
    const notes = await getRoadmapNotes();
    setRoadmapNotes(notes as RoadmapNoteRow[]);
    setIsLoadingRoadmap(false);
  }, []);

  const loadOverview = useCallback(async () => {
    const [runs, items, approval, seo, content, costRows] = await Promise.all([
      getLatestRunPerAgent(),
      getBestsellers(),
      getApprovalQueueCounts(),
      getSeoSummary(),
      getContentSummary(),
      getCostSummary(),
    ]);
    setLatestRuns(runs as Record<AgentName, RunLogRow | null>);
    setIsLoadingRuns(false);
    setBestsellers(items as BestsellerRow[]);
    setIsLoadingBestsellers(false);
    setApprovalCounts(approval);
    setIsLoadingApproval(false);
    setSeoSummary(seo as SeoSummaryRow | null);
    setContentSummary(content);
    setIsLoadingSummary(false);
    setCostGroups(groupCostByAgentMonth(costRows as CostLogRow[]));
    setIsLoadingCost(false);
  }, []);

  const loadTasks = useCallback(async () => {
    const [salesSyncTask, seoAuditTask, contentJob] = await Promise.all([
      getPendingAgentTask("sales_sync"),
      getPendingAgentTask("seo_audit"),
      getPendingContentJob(),
    ]);
    setPendingTasks({ sales_sync: salesSyncTask, seo_audit: seoAuditTask });
    setPendingContentJob(contentJob);
    setIsLoadingTasks(false);
  }, []);

  useEffect(() => {
    // Muat status run terakhir, bestseller, instruksi pending, & catatan
    // roadmap sekali di mount -- tidak ada cara lain mengetahui data
    // server tanpa efek ini.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOverview();
    loadTasks();
    loadRoadmapNotes();
  }, [loadOverview, loadTasks, loadRoadmapNotes]);

  useEffect(() => {
    // Selama masih ada instruksi/job pending, poll berkala -- agent
    // sekarang jalan otomatis di GitHub Actions (bukan lagi manual dari
    // laptop), jadi status di halaman ini perlu tahu sendiri begitu run
    // selesai, tanpa reload manual. Berhenti polling begitu semua beres.
    const hasPending = !!(pendingTasks.sales_sync || pendingTasks.seo_audit || pendingContentJob);
    if (!hasPending) return;
    const interval = setInterval(() => {
      loadTasks();
      loadOverview();
    }, 10000);
    return () => clearInterval(interval);
  }, [pendingTasks, pendingContentJob, loadTasks, loadOverview]);

  const handleSubmitTask = async (agentName: TaskableAgentName) => {
    setIsSubmittingTask(agentName);
    const result = await createAgentTaskRequest(agentName, instructionDrafts[agentName]);
    setIsSubmittingTask(null);
    if (!result.success) {
      toast.error(result.error || "Gagal mengajukan permintaan.");
      return;
    }
    toast.success("Permintaan diajukan -- agent akan jalan otomatis di GitHub Actions dalam beberapa saat.");
    setOpenInstructionFor(null);
    setInstructionDrafts((prev) => ({ ...prev, [agentName]: "" }));
    loadTasks();
  };

  const handleRequestContentJob = async () => {
    setIsSubmittingTask("content_writer");
    const result = await requestContentJob(contentInstructionDraft);
    setIsSubmittingTask(null);
    if (!result.success) {
      toast.error(result.error || "Gagal mengajukan permintaan artikel.");
      return;
    }
    toast.success("Permintaan diajukan -- agent akan jalan otomatis di GitHub Actions dalam beberapa saat.");
    setIsContentInstructionOpen(false);
    setContentInstructionDraft("");
    loadTasks();
  };

  const handleAddRoadmapNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoadmapText.trim()) return;
    setIsAddingRoadmapNote(true);
    const result = await createRoadmapNote(newRoadmapText);
    setIsAddingRoadmapNote(false);
    if (!result.success) {
      toast.error(result.error || "Gagal menambahkan catatan.");
      return;
    }
    setNewRoadmapText("");
    loadRoadmapNotes();
  };

  const handleToggleRoadmapNote = async (note: RoadmapNoteRow) => {
    // Update optimis di UI, sinkron ke database di belakang layar -- pola
    // sama handleToggleAvailability di app/admin/page.tsx.
    setRoadmapNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, done: !n.done } : n)));
    const result = await toggleRoadmapNote(note.id, !note.done);
    if (!result.success) {
      toast.error(result.error || "Gagal mengubah status catatan.");
      loadRoadmapNotes(); // rollback ke state database yang sebenarnya
    }
  };

  const handleDeleteRoadmapNote = async (note: RoadmapNoteRow) => {
    if (!confirm(`Hapus catatan "${note.text}"?`)) return;
    const result = await deleteRoadmapNote(note.id);
    if (!result.success) {
      toast.error(result.error || "Gagal menghapus catatan.");
      return;
    }
    setRoadmapNotes((prev) => prev.filter((n) => n.id !== note.id));
  };

  const handleToggleExpand = async (agentName: AgentName) => {
    if (expandedAgent === agentName) {
      setExpandedAgent(null);
      return;
    }
    setExpandedAgent(agentName);
    setIsLoadingHistory(true);
    const logs = await getAgentRunLogs(agentName);
    setHistory(logs as RunLogRow[]);
    setIsLoadingHistory(false);
  };

  const salesSyncRun = latestRuns?.sales_sync ?? null;
  const unmatchedCount = parseUnmatchedCount(salesSyncRun?.summary ?? null);

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
              <span className="text-xs text-[#665b56]">Karyawan AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241b18]">
              Agent Dashboard
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

        <AdminTabs active="agents" />

        <p className="text-xs text-[#968b85] mb-6">
          Ketiga agent (Sales Sync, SEO Auditor, Content Writer) jalan
          otomatis lewat GitHub Actions (dipicu instruksi di bawah, atau
          jadwal untuk Sales Sync & SEO Auditor) -- bukan proses yang selalu
          hidup, status di bawah adalah hasil run terakhir, bukan aktivitas
          real-time.
        </p>

        {/* Section 1: Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Card: Bestseller saat ini */}
          <div className="bg-white rounded-[18px] p-5 shadow-[0_2px_12px_rgba(168,40,104,0.04)] border border-[#f3d5e3]/30">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-[#241b18]">Produk Best Seller Saat Ini</span>
            </div>
            {isLoadingBestsellers ? (
              <div className="flex items-center gap-2 text-[#968b85] text-xs py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memuat...
              </div>
            ) : bestsellers.length === 0 ? (
              <p className="text-xs text-[#968b85]">
                Belum ada produk bestseller. Jalankan <code>python -m falya_crew</code>{" "}
                untuk sync pertama.
              </p>
            ) : (
              <ul className="space-y-2">
                {bestsellers.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#241b18] truncate">{item.name}</span>
                    <span className="text-[#665b56] shrink-0">
                      Rp {item.price.toLocaleString("id-ID")}
                      {item.unit ? `/${item.unit}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Card: Last sync Sales Sync */}
          <div className="bg-white rounded-[18px] p-5 shadow-[0_2px_12px_rgba(168,40,104,0.04)] border border-[#f3d5e3]/30">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs font-bold text-[#241b18]">Sync Terakhir (Sales Sync)</span>
            </div>
            {isLoadingRuns ? (
              <div className="flex items-center gap-2 text-[#968b85] text-xs py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memuat...
              </div>
            ) : !salesSyncRun ? (
              <StatusPill status="never" />
            ) : (
              <div className="space-y-2">
                <StatusPill status={salesSyncRun.status} />
                <p className="text-xs text-[#665b56]">
                  {formatDateTime(salesSyncRun.finishedAt ?? salesSyncRun.startedAt)}
                </p>
                {!!unmatchedCount && unmatchedCount > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-1 rounded-full w-fit">
                    <AlertTriangle className="w-3 h-3" />
                    {unmatchedCount} produk tidak match dengan katalog website
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Approval queue -- ringkasan + link, approve/reject
            aslinya ada di /admin/seo & /admin/blog, tidak diduplikasi di sini. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/admin/seo"
            className="group bg-white rounded-[18px] p-5 shadow-[0_2px_12px_rgba(168,40,104,0.04)] border border-[#f3d5e3]/30 hover:border-[#a82868]/30 transition flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Wand2 className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#241b18]">Fix SEO Menunggu Persetujuan</p>
                <p className="text-[11px] text-[#968b85]">
                  {isLoadingApproval ? "Memuat..." : `${approvalCounts.pendingSeoFixes} fix pending`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#968b85] group-hover:text-[#a82868] transition shrink-0" />
          </Link>

          <Link
            href="/admin/blog"
            className="group bg-white rounded-[18px] p-5 shadow-[0_2px_12px_rgba(168,40,104,0.04)] border border-[#f3d5e3]/30 hover:border-[#a82868]/30 transition flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#241b18]">Draft Artikel Menunggu Review</p>
                <p className="text-[11px] text-[#968b85]">
                  {isLoadingApproval ? "Memuat..." : `${approvalCounts.draftPosts} draft`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#968b85] group-hover:text-[#a82868] transition shrink-0" />
          </Link>
        </div>

        {/* Section 5: Ringkasan SEO & Konten */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-[18px] p-5 shadow-[0_2px_12px_rgba(168,40,104,0.04)] border border-[#f3d5e3]/30">
            <p className="text-xs font-bold text-[#241b18] mb-3">Audit SEO Terakhir</p>
            {isLoadingSummary ? (
              <div className="flex items-center gap-2 text-[#968b85] text-xs py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memuat...
              </div>
            ) : !seoSummary ? (
              <p className="text-xs text-[#968b85]">
                Belum ada laporan audit. Jalankan{" "}
                <code>python -m falya_crew.seo_audit</code>.
              </p>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] text-[#968b85]">{formatDateTime(seoSummary.generatedAt)}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      seoSummary.totalBrokenLinks > 0
                        ? "bg-red-100 text-red-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    <Link2Off className="w-3 h-3" />
                    {seoSummary.totalBrokenLinks} Broken Link
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    <Tags className="w-3 h-3" />
                    {seoSummary.totalMetaIssues} Isu Meta Tag
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${performanceBadgeClass(
                      seoSummary.avgPerformanceScore
                    )}`}
                  >
                    <Gauge className="w-3 h-3" />
                    Performance{" "}
                    {seoSummary.avgPerformanceScore !== null
                      ? Math.round(seoSummary.avgPerformanceScore)
                      : "N/A"}
                  </span>
                </div>
                <Link
                  href="/admin/seo"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#a82868] hover:underline"
                >
                  Lihat detail lengkap
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[18px] p-5 shadow-[0_2px_12px_rgba(168,40,104,0.04)] border border-[#f3d5e3]/30">
            <p className="text-xs font-bold text-[#241b18] mb-3">Konten Bulan Ini</p>
            {isLoadingSummary ? (
              <div className="flex items-center gap-2 text-[#968b85] text-xs py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memuat...
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[#241b18]">
                    <strong>{contentSummary.publishedThisMonth}</strong> artikel published bulan ini
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-[#241b18]">
                    <strong>{contentSummary.drafts}</strong> draft menunggu review
                  </span>
                </div>
                <Link
                  href="/admin/blog"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#a82868] hover:underline"
                >
                  Lihat semua artikel
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Progress */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(168,40,104,0.05)] border border-[#f3d5e3]/40">
          {isLoadingRuns ? (
            <div className="p-16 text-center text-[#968b85] flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#a82868]" />
              <p className="text-xs">Memuat status agent...</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f3d5e3]/20">
              {AGENT_ORDER.map((agentName) => {
                const run = latestRuns?.[agentName] ?? null;
                const isExpanded = expandedAgent === agentName;

                return (
                  <div key={agentName} className="p-5">
                    <button
                      onClick={() => handleToggleExpand(agentName)}
                      className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-bold text-sm text-[#241b18]">
                            {AGENT_LABELS[agentName]}
                          </span>
                          <StatusPill status={run?.status ?? "never"} />
                        </div>
                        <p className="text-[11px] text-[#968b85]">
                          {run ? formatDateTime(run.finishedAt ?? run.startedAt) : "Belum pernah dijalankan"}
                        </p>
                      </div>
                      <div className="shrink-0 text-[#968b85]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#f3d5e3]/40 space-y-3">
                        <p className="text-[11px] text-[#968b85]">
                          Trigger manual: <code>{AGENT_COMMANDS[agentName]}</code>
                        </p>
                        {isLoadingHistory ? (
                          <div className="flex items-center gap-2 text-[#968b85] text-xs py-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Memuat riwayat...
                          </div>
                        ) : history.length === 0 ? (
                          <p className="text-xs text-[#968b85]">Belum ada riwayat run.</p>
                        ) : (
                          <ul className="space-y-2">
                            {history.map((log) => (
                              <li
                                key={log.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs bg-[#faf0f4]/50 rounded-lg px-3 py-2"
                              >
                                <span className="shrink-0 text-[#665b56] w-40">
                                  {formatDateTime(log.startedAt)}
                                </span>
                                <span className="shrink-0">
                                  <StatusPill status={log.status} />
                                </span>
                                <span className="text-[#968b85] truncate">
                                  {log.status === "error"
                                    ? log.errorMessage ?? "-"
                                    : log.summary ?? "-"}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 3: Kasih instruksi (pengganti "chat") -- lihat bagian 0
            prd-dashboard.md: bukan chat real-time, cuma antrian instruksi
            yang diproses saat script dijalankan manual dari laptop. */}
        <div className="mt-8">
          <p className="text-xs font-bold text-[#241b18] mb-3">Kasih Instruksi</p>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(168,40,104,0.05)] border border-[#f3d5e3]/40">
            {isLoadingTasks ? (
              <div className="p-12 text-center text-[#968b85] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#a82868]" />
                <p className="text-xs">Memuat status permintaan...</p>
              </div>
            ) : (
              <div className="divide-y divide-[#f3d5e3]/20">
                {(["sales_sync", "seo_audit"] as TaskableAgentName[]).map((agentName) => {
                  const pending = pendingTasks[agentName];
                  const isOpen = openInstructionFor === agentName;

                  return (
                    <div key={agentName} className="p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="font-bold text-sm text-[#241b18]">{AGENT_LABELS[agentName]}</span>

                        {pending ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-100 px-3 py-2 rounded-full">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Menunggu diproses{pending.instruction ? `: "${pending.instruction}"` : ""}
                          </span>
                        ) : (
                          <Button
                            onClick={() => setOpenInstructionFor(isOpen ? null : agentName)}
                            variant="outline"
                            className="border-[#a82868]/30 hover:bg-[#faf0f4] text-[#a82868] font-semibold rounded-full text-xs flex items-center gap-1.5"
                          >
                            <Wand2 className="w-4 h-4" />
                            Minta Jalan + Instruksi
                          </Button>
                        )}
                      </div>

                      {isOpen && !pending && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            placeholder="Instruksi opsional, mis. &quot;fokus cek broken link aja&quot; -- kosongkan untuk jalankan seperti biasa"
                            value={instructionDrafts[agentName]}
                            onChange={(e) =>
                              setInstructionDrafts((prev) => ({ ...prev, [agentName]: e.target.value }))
                            }
                            className="bg-[#faf0f4] border-0 rounded-xl text-xs resize-none h-20"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setOpenInstructionFor(null)}
                              variant="ghost"
                              className="text-[#665b56] text-xs rounded-full"
                            >
                              Batal
                            </Button>
                            <Button
                              onClick={() => handleSubmitTask(agentName)}
                              disabled={isSubmittingTask === agentName}
                              className="bg-[#a82868] hover:bg-[#861f53] text-white font-semibold rounded-full text-xs flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Kirim
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Content Writer -- reuse requestContentJob/getPendingContentJob
                    yang sudah ada (ContentJobRequest sekarang punya field
                    instruction opsional, sama pola dengan AgentTaskRequest
                    di atas), tombol identik dengan /admin/blog. */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="font-bold text-sm text-[#241b18]">{AGENT_LABELS.content_writer}</span>

                    {pendingContentJob ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-100 px-3 py-2 rounded-full">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Menunggu diproses
                        {pendingContentJob.instruction ? `: "${pendingContentJob.instruction}"` : ""}
                      </span>
                    ) : (
                      <Button
                        onClick={() => setIsContentInstructionOpen((prev) => !prev)}
                        variant="outline"
                        className="border-[#a82868]/30 hover:bg-[#faf0f4] text-[#a82868] font-semibold rounded-full text-xs flex items-center gap-1.5"
                      >
                        <Wand2 className="w-4 h-4" />
                        Minta Artikel Baru (AI)
                      </Button>
                    )}
                  </div>

                  {isContentInstructionOpen && !pendingContentJob && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        placeholder='Arahan tema opsional, mis. "tulis soal snack box untuk acara kantor" -- kosongkan supaya AI pilih topik sendiri'
                        value={contentInstructionDraft}
                        onChange={(e) => setContentInstructionDraft(e.target.value)}
                        className="bg-[#faf0f4] border-0 rounded-xl text-xs resize-none h-20"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => {
                            setIsContentInstructionOpen(false);
                            setContentInstructionDraft("");
                          }}
                          variant="ghost"
                          className="text-[#665b56] text-xs rounded-full"
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={handleRequestContentJob}
                          disabled={isSubmittingTask === "content_writer"}
                          className="bg-[#a82868] hover:bg-[#861f53] text-white font-semibold rounded-full text-xs flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Kirim
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 7: Cost & usage -- estimasi dari AgentRunLog.estimatedCostUsd,
            rate masih placeholder (lihat DEEPSEEK_INPUT/OUTPUT_COST_PER_1M
            di config.py Karyawan AI). */}
        <div className="mt-8">
          <div className="flex items-center gap-1.5 mb-3">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-bold text-[#241b18]">Estimasi Biaya DeepSeek</span>
          </div>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(168,40,104,0.05)] border border-[#f3d5e3]/40">
            {isLoadingCost ? (
              <div className="p-12 text-center text-[#968b85] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#a82868]" />
                <p className="text-xs">Memuat data biaya...</p>
              </div>
            ) : costGroups.length === 0 ? (
              <div className="p-12 text-center text-[#968b85] text-xs">
                Belum ada data biaya tercatat -- muncul setelah agent dijalankan
                dengan telemetry aktif.
              </div>
            ) : (
              <div className="divide-y divide-[#f3d5e3]/20">
                {costGroups.map((group) => (
                  <div
                    key={`${group.agentName}|${group.monthKey}`}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#241b18]">
                        {AGENT_LABELS[group.agentName as AgentName] ?? group.agentName}
                      </p>
                      <p className="text-[11px] text-[#968b85]">
                        {formatMonthLabel(group.monthKey)} -- {group.runCount} run,{" "}
                        {group.totalTokens.toLocaleString("id-ID")} token
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#241b18]">
                      ${group.totalCostUsd.toFixed(4)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-[#968b85] mt-2">
            Estimasi berdasarkan rate placeholder -- cek harga DeepSeek aktual di{" "}
            <code>config.py</code> (Karyawan AI) sebelum angka ini dipercaya untuk
            keputusan nyata.
          </p>
        </div>

        {/* Section 6: Planning/roadmap -- checklist manual admin, BUKAN
            hasil dari agent. */}
        <div className="mt-8">
          <div className="flex items-center gap-1.5 mb-3">
            <ListChecks className="w-3.5 h-3.5 text-[#a82868]" />
            <span className="text-xs font-bold text-[#241b18]">Planning / Roadmap</span>
          </div>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(168,40,104,0.05)] border border-[#f3d5e3]/40">
            {isLoadingRoadmap ? (
              <div className="p-12 text-center text-[#968b85] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#a82868]" />
                <p className="text-xs">Memuat catatan...</p>
              </div>
            ) : (
              <>
                {roadmapNotes.length === 0 ? (
                  <div className="p-8 text-center text-[#968b85] text-xs">
                    Belum ada catatan. Tambahkan rencana/TODO di bawah.
                  </div>
                ) : (
                  <div className="divide-y divide-[#f3d5e3]/20">
                    {roadmapNotes.map((note) => (
                      <div key={note.id} className="p-3.5 sm:p-4 flex items-center gap-3">
                        <button
                          onClick={() => handleToggleRoadmapNote(note)}
                          className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition cursor-pointer ${
                            note.done
                              ? "bg-[#a82868] border-[#a82868]"
                              : "border-[#f3d5e3] hover:border-[#a82868]/50"
                          }`}
                          title={note.done ? "Tandai belum selesai" : "Tandai selesai"}
                        >
                          {note.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </button>
                        <span
                          className={`flex-1 text-sm ${
                            note.done ? "text-[#968b85] line-through" : "text-[#241b18]"
                          }`}
                        >
                          {note.text}
                        </span>
                        <button
                          onClick={() => handleDeleteRoadmapNote(note)}
                          className="p-1.5 text-[#968b85] hover:text-[#c74343] hover:bg-red-50 rounded-lg transition cursor-pointer shrink-0"
                          title="Hapus catatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={handleAddRoadmapNote}
                  className="p-3.5 sm:p-4 border-t border-[#f3d5e3]/20 flex items-center gap-2"
                >
                  <Input
                    placeholder="Tambah catatan baru..."
                    value={newRoadmapText}
                    onChange={(e) => setNewRoadmapText(e.target.value)}
                    className="bg-[#faf0f4] border-0 rounded-xl text-xs h-10 flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isAddingRoadmapNote || !newRoadmapText.trim()}
                    className="bg-[#a82868] hover:bg-[#861f53] text-white rounded-full text-xs h-10 px-4 flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
