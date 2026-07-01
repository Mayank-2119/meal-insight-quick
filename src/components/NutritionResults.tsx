import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Flame, Beef, Wheat, Droplet, Leaf, Candy, RotateCcw, CheckCircle2 } from "lucide-react";
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { addMeal } from "@/lib/meals";

// Base values per 100g (mock)
const BASE = {
  calories: 266,
  protein: 11,
  carbs: 33,
  fat: 10,
  fiber: 2.3,
  sugar: 3.6,
  healthScore: 72,
};

type Props = {
  imageUrl: string;
  onReset: () => void;
};

export function NutritionResults({ imageUrl, onReset }: Props) {
  const [portion, setPortion] = useState(1);
  const navigate = useNavigate();

  const handleLog = () => {
    addMeal({
      id: crypto.randomUUID(),
      name: "Margherita Pizza",
      emoji: "🍕",
      color: "#fed7aa",
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


  const v = useMemo(() => {
    const r = (n: number, d = 0) => {
      const p = Math.pow(10, d);
      return Math.round(n * portion * p) / p;
    };
    return {
      calories: r(BASE.calories),
      protein: r(BASE.protein, 1),
      carbs: r(BASE.carbs, 1),
      fat: r(BASE.fat, 1),
      fiber: r(BASE.fiber, 1),
      sugar: r(BASE.sugar, 1),
    };
  }, [portion]);

  const grams = Math.round(100 * portion);
  const score = BASE.healthScore;
  const scoreColor =
    score > 70
      ? "hsl(142 71% 45%)"
      : score >= 40
        ? "hsl(38 92% 50%)"
        : "hsl(0 84% 60%)";

  return (
    <div className="space-y-8">
      {/* TOP SECTION */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Left: image + name */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-xl shadow-primary/5">
            <img src={imageUrl} alt="Detected meal" className="aspect-square w-full object-cover" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Margherita Pizza</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <CheckCircle2 className="size-3.5" />
                94% confident
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Could also be: Cheese Pizza 4% • Focaccia 2%
            </p>
          </div>
        </div>

        {/* Right: portion + health score */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/60 bg-white p-6 shadow-xl shadow-primary/5">
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-semibold">Adjust portion size</label>
              <span className="text-lg font-bold text-primary">{portion.toFixed(2)}x</span>
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
              <span className="text-sm font-medium text-foreground">Estimating for {grams}g</span>
              <span>3x</span>
            </div>
          </div>

          {/* Health score */}
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
                Balanced meal with moderate calories and good protein content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MACRO CARDS */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MacroCard
          label="Calories"
          unit="kcal"
          value={v.calories}
          icon={<Flame className="size-5" />}
          tone="amber"
        />
        <MacroCard
          label="Protein"
          unit="g"
          value={v.protein}
          icon={<Beef className="size-5" />}
          tone="blue"
        />
        <MacroCard
          label="Carbs"
          unit="g"
          value={v.carbs}
          icon={<Wheat className="size-5" />}
          tone="green"
        />
        <MacroCard
          label="Fat"
          unit="g"
          value={v.fat}
          icon={<Droplet className="size-5" />}
          tone="red"
        />
      </section>

      {/* SECONDARY */}
      <section className="grid grid-cols-2 gap-4">
        <SecondaryCard label="Fiber" unit="g" value={v.fiber} icon={<Leaf className="size-4" />} />
        <SecondaryCard label="Sugar" unit="g" value={v.sugar} icon={<Candy className="size-4" />} />
      </section>

      {/* ACTIONS */}
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
        <Button size="lg" className="gap-2 shadow-sm">
          <CheckCircle2 className="size-4" />
          Log this meal
        </Button>
      </section>
    </div>
  );
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
