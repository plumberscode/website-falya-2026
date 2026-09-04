"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

interface CanvasSequenceScrollerProps {
  totalFrames?: number;
  fps?: number;
  totalDuration?: number;
}

// Minimal typing untuk Network Information API — belum masuk lib.dom.d.ts
// standar TypeScript, dan tidak didukung semua browser (mis. Safari/iOS).
interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
}

// Ambang waktu muat frame ke-2 (index 1) sebelum dianggap koneksi lambat.
// Dipakai sebagai fallback behavioral untuk browser tanpa Network
// Information API (mis. Safari/iOS) — lihat maybeEnterSlowMode().
const SLOW_FRAME_THRESHOLD_MS = 1200;

// Ambang untuk indikator "Memuat…": gambar dianggap "tertinggal" dari
// posisi scroll kalau selisihnya > BEHIND_FRAME_THRESHOLD frame, dan
// baru ditampilkan ke user kalau kondisi itu bertahan lebih dari
// BEHIND_TIME_THRESHOLD_MS (hindari kedip untuk lag sangat singkat).
const BEHIND_FRAME_THRESHOLD = 15;
const BEHIND_TIME_THRESHOLD_MS = 400;

export default function CanvasSequenceScroller({
  totalFrames = 301,
  fps = 15,
  totalDuration = 20,
}: CanvasSequenceScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [activeScene, setActiveScene] = useState<number>(1);
  // Mode sederhana untuk koneksi lambat: hero jadi 1 layar penuh (bukan
  // 450vh scroll-jack) — cukup frame pertama + judul + tagline, lalu
  // visitor lanjut scroll normal ke section berikutnya.
  const [isSlowMode, setIsSlowMode] = useState<boolean>(false);
  const mountTimeRef = useRef<number>(0);
  const slowModeAppliedRef = useRef<boolean>(false);
  // Indikator "Memuat…": true kalau gambar tertinggal jauh & lama dari
  // posisi scroll (lihat checkBuffering). behindSinceRef menyimpan kapan
  // kondisi "tertinggal" mulai, null kalau sedang tidak tertinggal.
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const isBufferingRef = useRef<boolean>(false);
  const behindSinceRef = useRef<number | null>(null);

  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const requestedRef = useRef<Set<number>>(new Set());
  const folderRef = useRef<string>("/videos/frames-desktop");
  // Desktop memakai AVIF (lebih ringkas ~30%), mobile tetap WebP agar
  // decode/scrub tetap mulus di HP. Fallback otomatis ke WebP jika AVIF gagal.
  const frameExtRef = useRef<"avif" | "webp">("avif");
  const currentFrameRef = useRef<number>(0);
  // Frame yang BENAR-BENAR sedang tampil di canvas (bukan target scroll murni).
  // Ini yang jadi sumber kebenaran untuk activeScene agar teks tidak pernah
  // mendahului gambar saat frame di sekitarnya belum selesai dimuat.
  const displayedFrameRef = useRef<number>(0);
  const activeSceneRef = useRef<number>(1);

  // Smooth Lerp Motion State Refs
  const targetProgressRef = useRef<number>(0);
  const smoothProgressRef = useRef<number>(0);
  const isTickingRef = useRef<boolean>(false);
  const animationFrameIdRef = useRef<number | null>(null);

  // ─── Slow-Connection Fallback: masuk mode hero 1-layar ──────────────────
  // Hanya diterapkan kalau user belum mulai scroll (scrollY masih ~0) saat
  // terdeteksi, supaya tidak ada lompatan posisi scroll yang mengganggu.
  const maybeEnterSlowMode = useCallback(() => {
    if (slowModeAppliedRef.current) return;
    if (typeof window === "undefined") return;
    if (window.scrollY > 50) return;
    slowModeAppliedRef.current = true;
    setIsSlowMode(true);
    // Hero sudah beralih ke tampilan 1-layar — indikator "Memuat…" tidak
    // relevan lagi di layout ini.
    if (isBufferingRef.current) {
      isBufferingRef.current = false;
      setIsBuffering(false);
    }
  }, []);

  // Sinyal instan (sebelum paint pertama): Network Information API.
  // Tidak semua browser mendukung ini (mis. Safari/iOS) — fallback
  // behavioral di bawah (timing frame ke-2) menutup celah itu.
  // Dijalankan sekali di mount sebelum paint agar tidak ada flash/CLS
  // saat beralih ke layout mode-lambat — ini kasus valid untuk membaca
  // API browser eksternal yang tidak bisa diketahui saat SSR/render awal.
  useLayoutEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & {
      connection?: NetworkInformation;
      mozConnection?: NetworkInformation;
      webkitConnection?: NetworkInformation;
    };
    const conn = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
    if (
      conn &&
      (conn.saveData === true ||
        conn.effectiveType === "2g" ||
        conn.effectiveType === "slow-2g")
    ) {
      slowModeAppliedRef.current = true;
      // Baca Network Information API sekali di mount, sebelum paint
      // pertama; tidak ada cara mengetahui ini saat render/SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSlowMode(true);
    }
  }, []);

  // ─── Scene → frame-range mapping ───────────────────────────────────────
  const scenes = useMemo(() => {
    const boundary = (sec: number) =>
      Math.min(
        totalFrames - 1,
        Math.max(0, Math.floor((sec / totalDuration) * (totalFrames - 1))),
      );
    return [
      { id: 1, start: 0, end: boundary(5.5) },
      { id: 2, start: boundary(5.5) + 1, end: boundary(10) },
      { id: 3, start: boundary(10) + 1, end: boundary(14.5) },
      { id: 4, start: boundary(14.5) + 1, end: totalFrames - 1 },
    ];
  }, [totalFrames, totalDuration]);

  const sceneForFrame = useCallback(
    (frame: number) => {
      for (let i = scenes.length - 1; i >= 0; i--) {
        if (frame >= scenes[i].start) return scenes[i].id;
      }
      return 1;
    },
    [scenes],
  );

  // Center-safe draw image on canvas with high quality interpolation.
  // Return value menandakan apakah frame benar-benar berhasil digambar
  // (sudah loaded) — dipakai untuk memastikan teks overlay tidak pernah
  // mendahului gambar yang sebenarnya tampil.
  const renderFrame = useCallback((frameIndex: number): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return false;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Center-Safe Cover Aspect Ratio
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = canvasWidth / imgRatio;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    return true;
  }, []);

  // ─── Resolve Frame yang Benar-Benar Bisa Ditampilkan ────────────────────
  // Mencegah teks overlay (scene) mendahului gambar: kalau targetFrame belum
  // loaded (fast-scroll / koneksi lambat), cari mundur frame ter-dekat yang
  // sudah loaded. Kalau tidak ada dalam radius, tetap tampilkan frame
  // terakhir yang sukses digambar (jangan pernah "mundur" balik ke frame 0).
  const isFrameReady = useCallback((index: number) => {
    const img = imagesRef.current[index];
    return !!img && img.complete && img.naturalWidth !== 0;
  }, []);

  const resolveDisplayFrame = useCallback(
    (targetFrame: number) => {
      if (isFrameReady(targetFrame)) return targetFrame;

      const RADIUS = 40;
      for (let offset = 1; offset <= RADIUS; offset++) {
        const candidate = targetFrame - offset;
        if (candidate < 0) break;
        if (isFrameReady(candidate)) return candidate;
      }

      return displayedFrameRef.current;
    },
    [isFrameReady],
  );

  // Gambar canvas + scene text di-update bersamaan, hanya berdasarkan frame
  // yang benar-benar loaded — dipanggil dari rAF loop maupun dari callback
  // load frame (kasus: frame yang ditunggu tiba setelah lerp sudah berhenti).
  const syncDisplay = useCallback(
    (targetFrame: number) => {
      const displayFrame = resolveDisplayFrame(targetFrame);
      if (displayFrame === displayedFrameRef.current) return;
      if (!renderFrame(displayFrame)) return;

      displayedFrameRef.current = displayFrame;
      const newScene = sceneForFrame(displayFrame);
      if (newScene !== activeSceneRef.current) {
        activeSceneRef.current = newScene;
        setActiveScene(newScene);
      }
    },
    [resolveDisplayFrame, renderFrame, sceneForFrame],
  );

  // Nyalakan/matikan indikator "Memuat…" berdasarkan seberapa jauh & lama
  // gambar (displayedFrameRef) tertinggal dari posisi scroll (targetFrame).
  // Dipanggil setelah syncDisplay supaya "behind" dihitung dari state
  // gambar yang paling baru di tick ini.
  const checkBuffering = useCallback((targetFrame: number) => {
    const behind =
      Math.abs(targetFrame - displayedFrameRef.current) > BEHIND_FRAME_THRESHOLD;

    if (!behind) {
      behindSinceRef.current = null;
      if (isBufferingRef.current) {
        isBufferingRef.current = false;
        setIsBuffering(false);
      }
      return;
    }

    const now = performance.now();
    if (behindSinceRef.current === null) {
      behindSinceRef.current = now;
    } else if (
      !isBufferingRef.current &&
      now - behindSinceRef.current > BEHIND_TIME_THRESHOLD_MS
    ) {
      isBufferingRef.current = true;
      setIsBuffering(true);
    }
  }, []);

  // ─── Single Frame Loader with Fallback ──────────────────────────────────
  const requestFrame = useCallback(
    (index: number, folder: string, highPriority = false) => {
      if (index < 0 || index >= totalFrames) return;
      if (requestedRef.current.has(index)) return;
      if (imagesRef.current[index]) return;
      requestedRef.current.add(index);

      const frameNumber = (index + 1).toString().padStart(4, "0");
      const img = new Image();
      if ("fetchPriority" in img) {
        img.fetchPriority = highPriority ? "high" : "auto";
      }
      const attemptedExt = frameExtRef.current;
      img.src = `${folder}/frame_${frameNumber}.${attemptedExt}`;

      img.onload = () => {
        imagesRef.current[index] = img;
        setLoadedCount((c) => c + 1);
        // Frame ke-2 dipakai sebagai probe kecepatan koneksi: kalau lambat
        // datang, kemungkinan besar frame-frame berikutnya juga akan lag
        // jauh di belakang posisi scroll — lebih baik masuk mode 1-layar.
        if (index === 1 && performance.now() - mountTimeRef.current > SLOW_FRAME_THRESHOLD_MS) {
          maybeEnterSlowMode();
        }
        if (index === currentFrameRef.current || index === 0) {
          syncDisplay(currentFrameRef.current);
          setIsLoading(false);
        }
      };

      img.onerror = () => {
        const loadFallback = (src: string) => {
          const fb = new Image();
          fb.src = src;
          fb.onload = () => {
            imagesRef.current[index] = fb;
            setLoadedCount((c) => c + 1);
            if (index === 1 && performance.now() - mountTimeRef.current > SLOW_FRAME_THRESHOLD_MS) {
              maybeEnterSlowMode();
            }
            if (index === currentFrameRef.current || index === 0) {
              syncDisplay(currentFrameRef.current);
              setIsLoading(false);
            }
          };
        };

        if (attemptedExt === "avif") {
          frameExtRef.current = "webp";
          loadFallback(`${folder}/frame_${frameNumber}.webp`);
          return;
        }
        loadFallback(`/videos/frames-desktop/frame_${frameNumber}.webp`);
      };
    },
    [totalFrames, syncDisplay, maybeEnterSlowMode],
  );

  // ─── On-Demand Frame Preload Window (Scroll-Driven Streamer) ───────────
  const preloadAround = useCallback(
    (centerFrame: number, folder: string, radius = 10) => {
      const start = Math.max(0, centerFrame - 2);
      const end = Math.min(totalFrames - 1, centerFrame + radius);
      for (let i = start; i <= end; i++) {
        requestFrame(i, folder, false);
      }
    },
    [totalFrames, requestFrame],
  );

  // ─── Free distant frames from memory on low-end mobile ───────────────────
  const evictDistantFrames = useCallback(
    (current: number) => {
      if (typeof document === "undefined") return;
      for (let i = 1; i < totalFrames; i++) {
        if (Math.abs(i - current) > 35 && imagesRef.current[i]) {
          imagesRef.current[i] = undefined;
          requestedRef.current.delete(i);
        }
      }
    },
    [totalFrames],
  );

  // ─── Initial Fast Hero Mount (Hanya Muat Frame 0 & 1 untuk LCP Instan) ──
  useEffect(() => {
    mountTimeRef.current = performance.now();

    const isDesktop =
      typeof window !== "undefined" ? window.innerWidth >= 768 : true;
    const folder = isDesktop
      ? "/videos/frames-desktop"
      : "/videos/frames-mobile";
    folderRef.current = folder;
    frameExtRef.current = "avif";

    // Muat HANYA frame 0 & 1 di awal agar First Contentful Paint & LCP instan
    requestFrame(0, folder, true);
    requestFrame(1, folder, false);

    // Timeout pengaman agar preloader tidak pernah hang. Kalau sampai
    // detik ini frame ke-2 masih belum termuat sama sekali, itu sinyal
    // koneksi sangat lambat — masuk mode hero 1-layar juga.
    const safety = setTimeout(() => {
      setIsLoading(false);
      if (!imagesRef.current[1]) {
        maybeEnterSlowMode();
      }
    }, 2000);
    return () => clearTimeout(safety);
  }, [requestFrame, maybeEnterSlowMode]);

  // ─── Canvas Resize Handler ──────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      renderFrame(displayedFrameRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [renderFrame]);

  // ─── Idle-Aware Smooth Lerp Motion Scrubber Engine ───────────────────────
  useEffect(() => {
    const LERP_SPEED = 0.15;

    const tick = () => {
      const current = smoothProgressRef.current;
      const target = targetProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.0002) {
        smoothProgressRef.current = current + diff * LERP_SPEED;
        const smoothProgress = smoothProgressRef.current;

        const targetFrame = Math.min(
          totalFrames - 1,
          Math.max(0, Math.floor(smoothProgress * (totalFrames - 1))),
        );

        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame;
          preloadAround(targetFrame, folderRef.current, 12);
          evictDistantFrames(targetFrame);
        }

        // Teks/scene & gambar mengikuti frame yang BENAR-BENAR sudah loaded
        // (bisa jadi tertinggal dari targetFrame saat fast-scroll / koneksi
        // lambat) — bukan posisi scroll target murni. Ini mencegah teks
        // mendahului gambar yang belum sempat digambar.
        syncDisplay(targetFrame);
        checkBuffering(targetFrame);

        // Lanjutkan animasi selama masih bergerak
        animationFrameIdRef.current = requestAnimationFrame(tick);
      } else {
        // Target tercapai, snap ke posisi akhir dan TIDURKAN rAF loop
        smoothProgressRef.current = target;
        const targetFrame = Math.min(
          totalFrames - 1,
          Math.max(0, Math.floor(target * (totalFrames - 1))),
        );
        currentFrameRef.current = targetFrame;
        syncDisplay(targetFrame);
        checkBuffering(targetFrame);

        isTickingRef.current = false;
        animationFrameIdRef.current = null;
      }
    };

    const startAnimationLoop = () => {
      if (!isTickingRef.current) {
        isTickingRef.current = true;
        animationFrameIdRef.current = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollHeight = container.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollHeight));
      targetProgressRef.current = progress;

      // Prefetch frame di sekitar posisi scroll baru
      const estimatedFrame = Math.min(
        totalFrames - 1,
        Math.max(0, Math.floor(progress * (totalFrames - 1))),
      );
      preloadAround(estimatedFrame, folderRef.current, 14);

      // Bangunkan loop rendering
      startAnimationLoop();
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [
    totalFrames,
    totalDuration,
    syncDisplay,
    checkBuffering,
    preloadAround,
    evictDistantFrames,
  ]);

  return (
    <div
      ref={containerRef}
      data-scrollytelling
      className={`relative w-full bg-[#241b18] ${isSlowMode ? "h-screen" : "h-[450vh]"}`}
    >
      {/* Sticky Fullscreen Canvas Viewport */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Progress bar tipis: muncul hanya saat gambar tertinggal dari
            posisi scroll (lihat checkBuffering), menunjukkan rasio frame
            yang sudah termuat agar visitor tahu hero masih menyusul. */}
        <div
          className={`absolute top-0 left-0 right-0 z-30 h-0.5 bg-white/10 transition-opacity duration-300 ${
            isBuffering ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <div
            className="h-full bg-food-gold transition-[width] duration-200 ease-out"
            style={{ width: `${Math.min(100, (loadedCount / totalFrames) * 100)}%` }}
          />
        </div>

        {/* First Frame Poster Image — Terdaftar instan oleh Chromium sebagai LCP */}
        <picture className="absolute inset-0 w-full h-full select-none pointer-events-none">
          <source
            media="(min-width: 768px)"
            srcSet="/videos/frames-desktop/frame_0001.avif"
            type="image/avif"
          />
          <source
            media="(max-width: 767px)"
            srcSet="/videos/frames-mobile/frame_0001.avif"
            type="image/avif"
          />
          <img
            src="/videos/frames-mobile/frame_0001.avif"
            alt="Falya Risol Mayo dan Nasi Liwet Balikpapan"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover select-none pointer-events-none"
            style={{
              filter: "contrast(1.05) saturate(1.05)",
            }}
          />
        </picture>

        {/* Canvas for ultra-smooth 60fps frame scrubbing */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300 will-change-transform z-[1]"
          style={{
            opacity: isLoading && loadedCount < 1 ? 0.6 : 1,
            filter: "contrast(1.05) saturate(1.05)",
            transform: "translateZ(0)",
          }}
        />

        {/* Soft Vignette Overlay for video background depth */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#241b18]/70 via-transparent to-[#241b18]/30 z-[2]" />

        {/* CLEAN STORY OVERLAYS (Only Title & Subtitle, No Dark Boxes, No Extra Elements) */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-6 md:p-16 lg:p-24">
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
              {/* SCENE 1 (Detik 0 - 5.5): Center (Tanpa delay animasi opacity untuk LCP instan) */}
              {activeScene === 1 && (
                <div
                  key="scene-1"
                  className="flex flex-col items-center text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
                >
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3 leading-tight font-serif">
                    Selamat datang di{" "}
                    <span className="text-[#f7b733]">Falya</span>
                  </h1>
                  <p className="text-base sm:text-xl text-white/95 font-normal leading-relaxed max-w-xl">
                    Spesial{" "}
                    <strong className="text-white font-bold">Risol</strong> dan{" "}
                    <strong className="text-white font-bold">Nasi Liwet</strong>{" "}
                    di Balikpapan
                  </p>
                </div>
              )}

              {/* SCENE 2 (Detik 5.5 - 10.0): Left aligned on Desktop */}
              {activeScene === 2 && (
                <div
                  key="scene-2"
                  className="flex flex-col items-center text-center md:items-start md:text-left md:self-start max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
                >
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-3 font-serif">
                    Hangat
                  </h2>
                  <p className="text-base sm:text-xl text-white/95 font-normal leading-relaxed">
                    Dimana Risol disajikan hangat,{" "}
                    <span className="text-[#f7b733] font-semibold">
                      digoreng ketika dipesan
                    </span>{" "}
                    untuk kerenyahan sempurna di setiap gigitan.
                  </p>
                </div>
              )}

              {/* SCENE 3 (Detik 10.0 - 14.5): Right aligned on Desktop */}
              {activeScene === 3 && (
                <div
                  key="scene-3"
                  className="flex flex-col items-center text-center md:items-end md:text-right md:self-end max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
                >
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-3 font-serif">
                    Bahagia
                  </h2>
                  <p className="text-base sm:text-xl text-white/95 font-normal leading-relaxed">
                    Teman setia di segala suasana. Dari sarapan santai, bekal
                    rapat, acara keluarga, hingga cemilan sore.
                  </p>
                </div>
              )}

              {/* SCENE 4 (Detik 14.5+): Center */}
              {activeScene === 4 && (
                <div
                  key="scene-4"
                  className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
                >
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-3 font-serif">
                    Menu & Order
                  </h2>
                  <p className="text-base sm:text-xl text-white/95 font-normal leading-relaxed max-w-xl">
                    Kami siap melayani pesanan kamu! Nikmati menu lezat kami
                    dengan pesan antar atau takeaway.
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Scroll Indicator — beralih jadi "Memuat…" (pulse, bukan bounce)
            saat gambar tertinggal jauh dari posisi scroll, supaya visitor
            tahu hero masih menyusul, bukan macet. */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-in fade-in duration-1000">
          <span className="text-white/80 text-[10px] tracking-[0.2em] uppercase mb-2 drop-shadow-md">
            {isBuffering ? "Memuat…" : "Scroll ke bawah"}
          </span>
          <div className="w-5 h-8 border border-white/60 rounded-full flex justify-center p-1 shadow-sm">
            <div
              className={`w-1 h-2 bg-white rounded-full ${isBuffering ? "animate-pulse" : "animate-bounce"}`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
