import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { Upload, Camera, History, Salad } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import pizzaImg from "@/assets/pizza.jpg";
import saladImg from "@/assets/salad.jpg";
import sushiImg from "@/assets/sushi.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const SAMPLES = [
  { name: "Pizza", src: pizzaImg },
  { name: "Salad", src: saladImg },
  { name: "Sushi", src: sushiImg },
];

function Index() {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const openUpload = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-1 text-lg font-bold tracking-tight">
            NutriSnap <span aria-hidden>🥗</span>
          </a>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="size-4" />
            History
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-32 pt-10 sm:px-6 sm:pt-16 md:pb-16">
        {/* Hero */}
        <section className="text-center">
          <div className="mx-auto mb-5 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Salad className="size-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Snap your meal, know your macros
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Upload a food photo and get instant nutritional breakdown
          </p>
        </section>

        {/* Upload zone */}
        <section
          className={cn(
            "mt-10 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 transition-colors",
            dragActive && "border-primary bg-primary/10",
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
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-4 px-6 py-14 text-center sm:py-20"
          >
            {preview ? (
              <img
                src={preview}
                alt="Selected meal"
                className="max-h-56 rounded-xl object-cover shadow-sm"
              />
            ) : (
              <>
                <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Upload className="size-6" />
                </div>
                <div>
                  <p className="text-base font-semibold">
                    Drag & drop your food photo
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or click to browse — JPG, PNG up to 10MB
                  </p>
                </div>
              </>
            )}
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
          <div className="border-t border-primary/20 p-4 sm:hidden">
            <Button
              variant="outline"
              className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="size-4" />
              Take Photo
            </Button>
          </div>
        </section>

        {/* Samples */}
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Try these
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {SAMPLES.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => setPreview(s.src)}
                className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={s.src}
                    alt={s.name}
                    width={512}
                    height={512}
                    loading="lazy"
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="px-3 py-2 text-sm font-medium">{s.name}</div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <Button
          className="w-full gap-2 shadow-sm"
          size="lg"
          onClick={openUpload}
        >
          <Upload className="size-4" />
          Upload Photo
        </Button>
      </div>
    </div>
  );
}
