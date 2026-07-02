import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { Upload, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NutritionResults } from "@/components/NutritionResults";
import demoPizza from "@/assets/demo-pizza.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const TRUST_BADGES = [
  { icon: "🎯", label: "82.4% Accuracy" },
  { icon: "⚡", label: "Instant Results" },
  { icon: "🥗", label: "101 Categories" },
];

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);

  const runDemo = useCallback(async () => {
    try {
      const res = await fetch(demoPizza);
      const blob = await res.blob();
      const f = new File([blob], "demo-pizza.jpg", { type: blob.type || "image/jpeg" });
      handleFile(f);
    } catch {
      // ignore
    }
  }, [handleFile]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const openUpload = () => fileInputRef.current?.click();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#f0fdf4] via-white to-white text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-white/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-1 text-lg font-semibold tracking-tight">
            NutriSnap <span aria-hidden>🥗</span>
          </Link>
          <Link
            to="/history"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            History
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32 pt-12 sm:px-6 sm:pt-16 md:pb-20">
        {preview && file ? (
          <NutritionResults imageFile={file} imageUrl={preview} onReset={reset} onDemo={runDemo} />
        ) : (
          <>
            {/* Hero */}
            <section className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
                </span>
                AI Powered • 101 Food Categories
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                Snap your meal, <br className="hidden sm:block" />
                know your{" "}
                <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                  macros
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
                Upload a food photo and get an instant, detailed nutritional breakdown in seconds.
              </p>
            </section>

            {/* Upload zone */}
            <section className="mt-12 sm:mt-14">
              <div
                className={cn(
                  "rounded-3xl border border-border/60 bg-white p-1 shadow-xl shadow-primary/5 transition-all",
                  dragActive && "scale-[1.01] shadow-2xl shadow-primary/10",
                )}
              >
                <div
                  className={cn(
                    "rounded-[1.25rem] border-2 border-dashed border-primary/40 bg-white transition-colors",
                    dragActive && "border-primary bg-primary/[0.02]",
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={onDrop}
                >
                  <button
                    type="button"
                    onClick={openUpload}
                    className="flex w-full cursor-pointer flex-col items-center justify-center gap-5 px-6 py-14 text-center sm:py-20"
                  >
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Upload className="size-7" />
                    </div>
                    <div>
                      <p className="text-base font-semibold sm:text-lg">
                        Drag & drop your food photo
                      </p>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        or click to browse — JPG, PNG up to 10MB
                      </p>
                    </div>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />

                  {/* Mobile Take Photo */}
                  <div className="border-t border-border/60 p-4 sm:hidden">
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="size-4" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Demo link */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={runDemo}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-emerald-700"
                >
                  <Sparkles className="size-3.5" />
                  Try a demo
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {TRUST_BADGES.map((badge) => (
                  <div
                    key={badge.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/80 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm"
                  >
                    <span aria-hidden>{badge.icon}</span>
                    {badge.label}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      {!preview && (
        <footer className="border-t border-border/60 bg-white/60 py-6 backdrop-blur-sm">
          <p className="mx-auto max-w-5xl px-4 text-center text-xs text-muted-foreground sm:px-6">
            Built with EfficientNet-B3 • USDA FoodData Central • 82.4% accuracy on Food-101
          </p>
        </footer>
      )}

      {/* Mobile sticky CTA */}
      {!preview && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-white/90 p-3 backdrop-blur-xl md:hidden">
          <Button
            className="w-full gap-2 shadow-sm"
            size="lg"
            onClick={openUpload}
          >
            <Upload className="size-4" />
            Upload Photo
          </Button>
        </div>
      )}
    </div>
  );
}
