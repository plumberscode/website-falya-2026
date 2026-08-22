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

  // ─── Scene → frame-range mapping ───────────────────────────────────────
  // Scenes split across totalDuration at the 5.5s / 10s / 14.5s boundaries.
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

  // Frames requested during the initial mount (drives the preloader progress bar)
  const initialRequestTarget = useMemo(() => {
    const scene1 = scenes[0];
    const scene2 = scenes[1];
    const restEnd = Math.min(scene1.end + 6, totalFrames - 1);
    const previewEnd = Math.min(scene2.start + 20, scene2.end);
    return restEnd + 1 + (previewEnd - scene2.start + 1);
  }, [scenes, totalFrames]);

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

  // ─── Lazy, scene-aware frame loader ────────────────────────────────────
  // Only the frames for the active scene (+ small buffer + next-scene preview)
  // are requested, instead of eagerly downloading all ~300 frames on page load.
  const requestFrame = useCallback(
    (index: number, folder: string, highPriority = false) => {
      if (index < 0 || index >= totalFrames) return;
      if (requestedRef.current.has(index)) return;
      if (imagesRef.current[index]) return;
      requestedRef.current.add(index);

      const frameNumber = (index + 1).toString().padStart(4, "0");
      const img = new Image();
      // Hint the browser to fetch opening frames first (faster first paint).
      if ("fetchPriority" in img)
        img.fetchPriority = highPriority ? "high" : "auto";
      const attemptedExt = frameExtRef.current;
      img.src = `${folder}/frame_${frameNumber}.${attemptedExt}`;

      img.onload = () => {
        imagesRef.current[index] = img;
        setLoadedCount((c) => c + 1);
        // Redraw if this is the frame currently being shown
        if (index === currentFrameRef.current) renderFrame(index);
      };

      img.onerror = () => {
        // Retry a failed frame with a fallback source.
        const loadFallback = (src: string) => {
          const fb = new Image();
          fb.src = src;
          fb.onload = () => {
            imagesRef.current[index] = fb;
            setLoadedCount((c) => c + 1);
            if (index === currentFrameRef.current) renderFrame(index);
          };
        };

        // 1) Format fallback: AVIF gagal dimuat (browser lama) → coba WebP
        //    dan ingat untuk memakai WebP seterusnya agar tak gagal berulang.
        if (attemptedExt === "avif") {
          frameExtRef.current = "webp";
          loadFallback(`${folder}/frame_${frameNumber}.webp`);
          return;
        }
        // 2) Folder fallback: frame hilang di folder adaptif → pakai desktop.
        loadFallback(`/videos/frames-desktop/frame_${frameNumber}.webp`);
      };
    },
    [totalFrames, renderFrame],
  );

  // Request a frame range in small chunks so the main thread stays responsive
  const requestRange = useCallback(
    (start: number, end: number, folder: string, chunkSize = 12) => {
      const clampedStart = Math.max(0, start);
      const clampedEnd = Math.min(totalFrames - 1, end);
      for (let i = clampedStart; i <= clampedEnd; i += chunkSize) {
        const chunkStart = i;
        const chunkEnd = Math.min(clampedEnd, i + chunkSize - 1);
        // Slight stagger between chunks keeps the page responsive
        setTimeout(
          () => {
            for (let j = chunkStart; j <= chunkEnd; j++)
              requestFrame(j, folder);
          },
          Math.floor((chunkStart - clampedStart) / chunkSize) * 30,
        );
      }
    },
    [totalFrames, requestFrame],
  );

  // Release decoded frames far from the active scene so memory stays bounded on
  // low-end mobile. Evicted frames are re-requestable if the user scrolls back.
  const evictDistantFrames = useCallback(
    (active: number) => {
      if (typeof document === "undefined") return;

      const keep = new Set<number>();
      const keepScene = (sc?: { start: number; end: number }) => {
        if (!sc) return;
        const s = Math.max(0, sc.start - 16);
        const e = Math.min(totalFrames - 1, sc.end + 16);
        for (let j = s; j <= e; j++) keep.add(j);
      };

      // Always keep the intro scene so returning to the top is instant.
      keepScene(scenes[0]);
      // Keep the active scene ± 1 for smooth back-and-forth scrubbing.
      for (
        let i = Math.max(1, active - 1);
        i <= Math.min(scenes.length, active + 1);
        i++
      ) {
        keepScene(scenes[i - 1]);
      }
      // Never evict the frame currently on screen (or its neighbours).
      for (
        let j = Math.max(0, currentFrameRef.current - 4);
        j <= Math.min(totalFrames - 1, currentFrameRef.current + 4);
        j++
      ) {
        keep.add(j);
      }

      let evicted = 0;
      for (let i = 0; i < totalFrames; i++) {
        if (!keep.has(i) && imagesRef.current[i]) {
          imagesRef.current[i] = undefined;
          requestedRef.current.delete(i); // allow re-request on scroll-back
          evicted++;
        }
      }
      if (evicted > 0) {
        // eslint-disable-next-line no-console
        console.log(`[Falya] evicted ${evicted} frames to free mobile memory`);
      }
    },
    [scenes, totalFrames],
  );

  // Adaptive resolution + instant first frames so the hero appears immediately
  useEffect(() => {
    const isDesktop =
      typeof window !== "undefined" ? window.innerWidth >= 768 : true;
    const folder = isDesktop
      ? "/videos/frames-desktop"
      : "/videos/frames-mobile";
    folderRef.current = folder;
    // Desktop: AVIF (lebih ringkas). Mobile: WebP agar decode/scrub mulus.
    frameExtRef.current = isDesktop ? "avif" : "webp";

    const priorityBatch = () => {
      for (let i = 0; i < Math.min(20, totalFrames); i++) {
        requestFrame(i, folder, true);
      }
    };

    // Defer initial loading until the hero actually enters the viewport, so we
    // don't spend data/CPU on frames the user isn't looking at yet.
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") {
      priorityBatch();
      const safety = setTimeout(() => setIsLoading(false), 6000);
      return () => clearTimeout(safety);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          priorityBatch();
          io.disconnect();
        }
      },
      { rootMargin: "160px 0px" },
    );
    io.observe(container);

    // Safety net: never let the preloader hang if frames fail to load
    const safety = setTimeout(() => setIsLoading(false), 6000);
    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, [totalFrames, requestFrame]);

  // Hide the preloader as soon as frame pertama siap (sudah di-preload),
  // sehingga LCP (hero) tampil secepat mungkin — food-first.
  useEffect(() => {
    if (loadedCount >= Math.min(1, totalFrames)) {
      setIsLoading(false);
    }
  }, [loadedCount, totalFrames]);

  // On scene change: request the active scene (+ buffer) and preview the next
  useEffect(() => {
    const folder = folderRef.current;
    const scene = scenes[activeScene - 1];
    if (!scene) return;

    const start = Math.max(0, scene.start - 6);
    const end = Math.min(totalFrames - 1, scene.end + 6);
    requestRange(start, end, folder, 12);

    // Preload a short preview of the following scene for a smooth transition
    const nextScene = scenes[activeScene];
    if (nextScene) {
      const previewEnd = Math.min(nextScene.start + 20, nextScene.end);
      requestRange(nextScene.start, previewEnd, folder, 12);
    }

    // Free memory from frames far from the active scene (mobile focus).
    evictDistantFrames(activeScene);
  }, [activeScene, scenes, requestRange, totalFrames, evictDistantFrames]);

  // Canvas Resize Handler
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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderFrame]);

  // 60FPS Apple-style Smooth Lerp Motion Scrubber Engine
  useEffect(() => {
    let animationFrameId: number;

    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollHeight = container.scrollHeight - window.innerHeight;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollHeight));
      targetProgressRef.current = progress;
    };

    // Smooth Lerp Rendering Loop
    const LERP_SPEED = 0.14; // Tuned for silky-smooth buttery response without lag

    const tick = () => {
      const current = smoothProgressRef.current;
      const target = targetProgressRef.current;

      // Interpolate progress towards target
      const diff = target - current;
      if (Math.abs(diff) > 0.0001) {
        smoothProgressRef.current = current + diff * LERP_SPEED;
      } else {
        smoothProgressRef.current = target;
      }

      const smoothProgress = smoothProgressRef.current;

      // Calculate target frame
      const targetFrame = Math.min(
        totalFrames - 1,
        Math.max(0, Math.floor(smoothProgress * (totalFrames - 1))),
      );

      // Update overlay scene only when it actually changes (avoids 60fps re-renders)
      const newScene = sceneForFrame(targetFrame);
      if (newScene !== activeSceneRef.current) {
        activeSceneRef.current = newScene;
        setActiveScene(newScene);
      }

      if (targetFrame !== currentFrameRef.current) {
        currentFrameRef.current = targetFrame;
        renderFrame(targetFrame);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [totalFrames, totalDuration, sceneForFrame, renderFrame]);

  const loadProgressPercent = Math.min(
    100,
    Math.round((loadedCount / Math.max(1, initialRequestTarget)) * 100),
  );

  return (
    <div ref={containerRef} className="relative w-full h-[450vh] bg-[#241b18]">
      {/* Sticky Fullscreen Canvas Viewport */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Canvas for ultra-smooth 60fps frame scrubbing */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover select-none pointer-events-none transition-opacity duration-700 will-change-transform"
          style={{
            opacity: isLoading && loadedCount < 1 ? 0.3 : 1,
            filter: "contrast(1.05) saturate(1.05)",
            transform: "translateZ(0)",
          }}
        />

        {/* Soft Vignette Overlay for video background depth */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#241b18]/70 via-transparent to-[#241b18]/30" />

        {/* Preloader */}
        {isLoading && loadedCount < 1 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#fdfbfc]/95 backdrop-blur-md z-40 text-[#241b18]">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3.5 h-3.5 rounded-full bg-[#a82868] animate-ping" />
              <p className="font-semibold text-base">Memuat Falya...</p>
            </div>
            <div className="w-56 h-2 bg-[#f3d5e3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#a82868] transition-all duration-300 rounded-full"
                style={{ width: `${loadProgressPercent}%` }}
              />
            </div>
            <span className="text-xs text-[#665b56] mt-2 font-mono">
              {loadProgressPercent}% siap
            </span>
          </div>
        )}

        {/* CLEAN STORY OVERLAYS (Only Title & Subtitle, No Dark Boxes, No Extra Elements) */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-6 md:p-16 lg:p-24">
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
              {/* SCENE 1 (Detik 0 - 5.5): Center */}
              {activeScene === 1 && (
                <div
                  key="scene-1"
                  className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
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
      </div>
    </div>
  );
}
