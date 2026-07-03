import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Flame,
  Beef,
  Wheat,
  Droplet,
  Leaf,
  Candy,
  RotateCcw,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  Pencil,
  Search,
} from "lucide-react";
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { addMeal } from "@/lib/meals";
import { predictFood, lookupNutrition, type Prediction } from "@/lib/api";

const FOOD_EMOJI: Record<string, string> = {
  pizza: "🍕",
  burger: "🍔",
  hamburger: "🍔",
  sushi: "🍣",
  salad: "🥗",
  pasta: "🍝",
  spaghetti: "🍝",
  steak: "🥩",
  taco: "🌮",
  ramen: "🍜",
  soup: "🍲",
  sandwich: "🥪",
  bread: "🍞",
  rice: "🍚",
  cake: "🍰",
  donut: "🍩",
  ice_cream: "🍦",
  fries: "🍟",
};

function guessEmoji(label: string) {
  const key = label.toLowerCase();
  for (const k of Object.keys(FOOD_EMOJI)) {
    if (key.includes(k)) return FOOD_EMOJI[k];
  }
  return "🍽️";
}

function formatLabel(label: string) {
  return label
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type Props = {
  imageFile: File;
  imageUrl: string;
  onReset: () => void;
  onDemo?: () => void;
};

export function NutritionResults({ imageFile, imageUrl, onReset, onDemo }: Props) {
  const [portion, setPortion] = useState(2.5);
  const [data, setData] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqIdRef = useRef(0);
  const fileRef = useRef<File>(imageFile);
  const isFirstRun = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    fileRef.current = imageFile;
  }, [imageFile]);

  useEffect(() => {
    const runPredict = () => {
      const id = ++reqIdRef.current;
      if (data === null) setLoading(true);
      else setRecalculating(true);
      setError(null);
      predictFood(fileRef.current, portion)
        .then((res) => {
          if (reqIdRef.current !== id) return;
          setData(res);
          setLoading(false);
          setRecalculating(false);
        })
        .catch((err: Error) => {
          if (reqIdRef.current !== id) return;
          setLoading(false);
          setRecalculating(false);
          setError(err.message || "Prediction failed");
        });
    };

    if (isFirstRun.current) {
      isFirstRun.current = false;
      runPredict();
      return;
    }

    const t = setTimeout(runPredict, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portion, imageFile]);

  if (loading && !data) {
    return <LoadingSkeleton imageUrl={imageUrl} />;
  }

  if (error && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-red-500/5">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle className="size-7" />
          </div>
          <h3 className="mt-5 text-lg font-bold">Couldn't identify this food.</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a clearer photo or better lighting.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <Button variant="outline" onClick={onReset} className="gap-2">
              <RotateCcw className="size-4" />
              Try Again
            </Button>
            {onDemo && (
              <Button onClick={onDemo} className="gap-2">
                <Sparkles className="size-4" />
                Try Demo
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const foodName = formatLabel(data.food_label);
  const emoji = guessEmoji(data.food_label);
  const confidencePct = Math.round(data.confidence * 100);
  const alternates = data.top3
    .filter((t) => t.label !== data.food_label)
    .slice(0, 2)
    .map((t) => `${formatLabel(t.label)} ${Math.round(t.confidence * 100)}%`)
    .join(" • ");

  const v = {
    calories: Math.round(data.nutrition.calories),
    protein: round1(data.nutrition.protein),
    carbs: round1(data.nutrition.carbs),
    fat: round1(data.nutrition.fat),
    fiber: round1(data.nutrition.fiber),
    sugar: round1(data.nutrition.sugar),
  };

  const grams = Math.round(100 * portion);
  const score = Math.round(data.health_score);
  const scoreColor =
    score > 70
      ? "hsl(142 71% 45%)"
      : score >= 40
        ? "hsl(38 92% 50%)"
        : "hsl(0 84% 60%)";

  const handleLog = () => {
    addMeal({
      id: crypto.randomUUID(),
      name: foodName,
      emoji,
      color: "#dcfce7",
      imageUrl,
      loggedAt: Date.now(),
      calories: v.calories,
      protein: v.protein,
      carbs: v.carbs,
      fat: v.fat,
      fiber: v.fiber,
      sugar: v.sugar,
    });
    toast.success("Meal logged", { description: "Added to today's history." });
    navigate({ to: "/history" });
  };

  const macros = [
    { label: "Calories", unit: "kcal", value: v.calories, icon: <Flame className="size-5" />, tone: "amber" as const },
    { label: "Protein", unit: "g", value: v.protein, icon: <Beef className="size-5" />, tone: "blue" as const },
    { label: "Carbs", unit: "g", value: v.carbs, icon: <Wheat className="size-5" />, tone: "green" as const },
    { label: "Fat", unit: "g", value: v.fat, icon: <Droplet className="size-5" />, tone: "red" as const },
  ];

  return (
    <div className={cn("space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500", loading && "opacity-70 transition-opacity")}>
      {/* TOP SECTION */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-xl shadow-primary/5">
            <img src={imageUrl} alt="Detected meal" className="aspect-square w-full object-cover" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{foodName}</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <CheckCircle2 className="size-3.5" />
                {confidencePct}% confident
              </span>
            </div>
            {alternates && (
              <p className="mt-2 text-sm text-muted-foreground">Could also be: {alternates}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border/60 bg-white p-6 shadow-xl shadow-primary/5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Adjust portion size</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs font-medium border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
                  onClick={() => setPortion(2.5)}
                >
                  Typical serving
                </Button>
                <span className="text-lg font-bold text-primary">{portion.toFixed(2)}x</span>
              </div>
            </div>
            <Slider
              className="mt-6"
              min={0.5}
              max={3}
              step={0.25}
              value={[portion]}
              onValueChange={([val]) => setPortion(val)}
            />
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>0.5x</span>
              <span className="text-sm font-medium text-foreground">
                {recalculating ? (
                  <span className="inline-flex items-center gap-1.5 text-primary">
                    <Loader2 className="size-3 animate-spin" /> Recalculating…
                  </span>
                ) : (
                  `Estimating for ${grams}g`
                )}
              </span>
              <span>3x</span>
            </div>
          </div>

          <div className="flex items-center gap-5 rounded-3xl border border-border/60 bg-white p-6 shadow-xl shadow-primary/5">
            <div className="relative size-28 shrink-0">
              <RadialBarChart
                width={112}
                height={112}
                cx={56}
                cy={56}
                innerRadius={44}
                outerRadius={56}
                barSize={12}
                startAngle={90}
                endAngle={-270}
                data={[{ name: "score", value: score, fill: scoreColor }]}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: "hsl(0 0% 94%)" }} dataKey="value" cornerRadius={999} />
              </RadialBarChart>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold" style={{ color: scoreColor }}>
                  {score}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  / 100
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Health Score</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {score > 70
                  ? "Great choice — nutrient-dense and balanced."
                  : score >= 40
                    ? "Balanced meal, enjoy in moderation."
                    : "Consider pairing with something lighter."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={cn("grid grid-cols-2 gap-4 sm:grid-cols-4 transition-opacity", recalculating && "opacity-60")}>
        {macros.map((m, i) => (
          <div
            key={m.label}
            className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500"
            style={{ animationDelay: `${150 + i * 90}ms` }}
          >
            <MacroCard {...m} recalculating={recalculating} />
          </div>
        ))}
      </section>

      <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
        Nutrition values are estimated per 100g of the identified food. Use the portion slider to adjust for your actual serving size.
      </p>

      <section className="grid grid-cols-2 gap-4">
        <SecondaryCard label="Fiber" unit="g" value={v.fiber} icon={<Leaf className="size-4" />} />
        <SecondaryCard label="Sugar" unit="g" value={v.sugar} icon={<Candy className="size-4" />} />
      </section>

      <section className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-center">
        <Button
          variant="outline"
          size="lg"
          className="gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
          onClick={onReset}
        >
          <RotateCcw className="size-4" />
          Scan another
        </Button>
        <Button size="lg" className="gap-2 shadow-sm" onClick={handleLog}>
          <CheckCircle2 className="size-4" />
          Log this meal
        </Button>
      </section>
    </div>
  );
}

function LoadingSkeleton({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Loader2 className="size-6 animate-spin" />
        </div>
        <p className="text-lg font-semibold">Analysing your meal...</p>
        <p className="text-sm text-muted-foreground">Identifying food and estimating nutrition.</p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-xl shadow-primary/5">
            <img src={imageUrl} alt="Uploaded meal" className="aspect-square w-full object-cover opacity-80" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </section>

      <section className="grid grid-cols-2 gap-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </section>
    </div>
  );
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

const TONES = {
  amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  red: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-100" },
} as const;

function MacroCard({
  label,
  value,
  unit,
  icon,
  tone,
}: {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  tone: keyof typeof TONES;
  recalculating?: boolean;
}) {
  const t = TONES[tone];
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-lg shadow-primary/5 transition-transform hover:-translate-y-0.5">
      <div className={cn("inline-flex size-9 items-center justify-center rounded-xl ring-4", t.bg, t.text, t.ring)}>
        {icon}
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-extrabold tracking-tight sm:text-3xl">{value}</span>
        <span className="text-xs font-medium text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function SecondaryCard({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-white p-5 shadow-lg shadow-primary/5">
      <div className="flex items-center gap-3">
        <div className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
