/**
 * Trigger workflow GitHub Actions di repo falya-crew (agent Python) lewat
 * repository_dispatch -- dipanggil setelah baris pending
 * (ContentJobRequest/AgentTaskRequest) dibuat, supaya agent jalan segera
 * daripada menunggu jadwal cron berikutnya (atau, untuk content_writer,
 * menunggu manusia sadar & jalankan manual -- agent itu tidak punya
 * jadwal sama sekali).
 *
 * Fire-and-forget: gagal trigger TIDAK menggagalkan action pemanggil
 * (baris pending tetap tersimpan) -- cuma di-log. Hasil run yang
 * sebenarnya tetap dilaporkan lewat AgentRunLog
 * (app/api/admin/agents/run-log), bukan lewat response call ini.
 */

const GITHUB_OWNER = "plumberscode";
const GITHUB_REPO = "falya-crew";

export type AgentEventType =
  | "sales_sync_dispatch"
  | "seo_audit_dispatch"
  | "content_writer_dispatch"
  | "keyword_strategist_dispatch";

export async function triggerAgentWorkflow(eventType: AgentEventType): Promise<void> {
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    console.error("GITHUB_DISPATCH_TOKEN belum di-set -- lewati trigger otomatis.");
    return;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event_type: eventType }),
      }
    );

    if (response.status !== 204) {
      const text = await response.text();
      console.error(`GitHub dispatch (${eventType}) gagal: ${response.status} ${text}`);
    }
  } catch (error) {
    console.error(`GitHub dispatch (${eventType}) error:`, error);
  }
}
