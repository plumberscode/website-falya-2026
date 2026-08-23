"use client";

import React, {
  useEffect,
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

  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const requestedRef = useRef<Set<number>>(new Set());
  const folderRef = useRef<string>("/videos/frames-desktop");
  // Desktop memakai AVIF (lebih ringkas ~30%), mobile tetap WebP agar
  // decode/scrub tetap mulus di HP. Fallback otomatis ke WebP jika AVIF gagal.
  const frameExtRef = useRef<"avif" | "webp">("avif");
  const currentFrameRef = useRef<number>(0);
  const activeSceneRef = useRef<number>(1);

  // Smooth Lerp Motion State Refs
  const targetProgressRef = useRef<number>(0);
  const smoothProgressRef = useRef<number>(0);
  const isTickingRef = useRef<boolean>(false);
  const animationFrameIdRef = useRef<number | null>(null);

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

  // Center-safe draw image on canvas with high quality interpolation
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

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
        if (index === currentFrameRef.current || index === 0) {
          renderFrame(index);
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
            if (index === currentFrameRef.current || index === 0) {
              renderFrame(index);
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
    [totalFrames, renderFrame],
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

    // Timeout pengaman agar preloader tidak pernah hang
    const safety = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(safety);
  }, [requestFrame]);

  // ─── Canvas Resize Handler ──────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      renderFrame(currentFrameRef.current);
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

        const newScene = sceneForFrame(targetFrame);
        if (newScene !== activeSceneRef.current) {
          activeSceneRef.current = newScene;
          setActiveScene(newScene);
        }

        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame;
          renderFrame(targetFrame);
          preloadAround(targetFrame, folderRef.current, 12);
          evictDistantFrames(targetFrame);
        }

        // Lanjutkan animasi selama masih bergerak
        animationFrameIdRef.current = requestAnimationFrame(tick);
      } else {
        // Target tercapai, snap ke posisi akhir dan TIDURKAN rAF loop
        smoothProgressRef.current = target;
        const targetFrame = Math.min(
          totalFrames - 1,
          Math.max(0, Math.floor(target * (totalFrames - 1))),
        );

        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame;
          renderFrame(targetFrame);
        }

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
  }, [totalFrames, totalDuration, sceneForFrame, renderFrame, preloadAround, evictDistantFrames]);

  return (
    <div ref={containerRef} className="relative w-full h-[450vh] bg-[#241b18]">
      {/* Sticky Fullscreen Canvas Viewport */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
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
                    Jagonya{" "}
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

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-in fade-in duration-1000">
          <span className="text-white/80 text-[10px] tracking-[0.2em] uppercase mb-2 drop-shadow-md">Scroll ke bawah</span>
          <div className="w-5 h-8 border border-white/60 rounded-full flex justify-center p-1 shadow-sm">
            <div className="w-1 h-2 bg-white rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
