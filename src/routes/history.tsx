import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Utensils, Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { GOALS, isSameDay, loadMeals, saveMeals, type Meal } from "@/lib/meals";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Meal History — NutriSnap" },
      { name: "description", content: "Review the meals you've logged today and track your daily macros." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setMeals(loadMeals());
  }, []);

  const now = Date.now();
  const today = meals.filter((m) => isSameDay(m.loggedAt, now));

  const totals = today.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const clearMeal = (id: string) => {
    const next = meals.filter((m) => m.id !== id);
    setMeals(next);
    saveMeals(next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] via-white to-white text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-white/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-1 text-lg font-semibold tracking-tight">
            NutriSnap <span aria-hidden>🥗</span>
          </Link>
          <Link
            to="/history"
            className="text-sm font-medium text-primary"
          >
            History
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Meal History</h1>
        </div>

        {/* Today's Summary */}
        <section className="rounded-3xl border border-border/60 bg-white p-6 shadow-xl shadow-primary/5 sm:p-7">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold">Today's Summary</h2>
            <span className="text-xs font-medium text-muted-foreground">
              {today.length} {today.length === 1 ? "meal" : "meals"} logged
            </span>
          </div>
          <div className="space-y-5">
            <StatBar label="Calories" unit="kcal" value={Math.round(totals.calories)} goal={GOALS.calories} />
            <StatBar label="Protein" unit="g" value={round1(totals.protein)} goal={GOALS.protein} />
            <StatBar label="Carbs" unit="g" value={round1(totals.carbs)} goal={GOALS.carbs} />
            <StatBar label="Fat" unit="g" value={round1(totals.fat)} goal={GOALS.fat} />
          </div>
        </section>

        {/* Meals Logged */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold">Meals Logged</h2>

          {today.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-3">
              {today.map((meal) => {
                const isOpen = expanded === meal.id;
                return (
                  <li
                    key={meal.id}
                    className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-lg shadow-primary/5 transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : meal.id)}
                      className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/30"
                    >
                      <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                        style={{ backgroundColor: meal.color }}
                      >
                        {meal.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{meal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(meal.loggedAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold">{Math.round(meal.calories)}</p>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          kcal
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-border/60 bg-muted/20 px-4 py-4">
                        <div className="grid grid-cols-4 gap-3">
                          <MacroPill label="Protein" value={meal.protein} tone="text-blue-600" />
                          <MacroPill label="Carbs" value={meal.carbs} tone="text-emerald-600" />
                          <MacroPill label="Fat" value={meal.fat} tone="text-red-600" />
                          <MacroPill label="Fiber" value={meal.fiber} tone="text-primary" />
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearMeal(meal.id);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function StatBar({
  label,
  value,
  goal,
  unit,
}: {
  label: string;
  value: number;
  goal: number;
  unit: string;
}) {
  const pct = Math.min(100, (value / goal) * 100);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-sm tabular-nums text-muted-foreground">
          <span className="font-bold text-foreground">{value}</span> / {goal} {unit}
        </span>
      </div>
      <Progress value={pct} className="h-2.5" />
    </div>
  );
}

function MacroPill({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1 text-lg font-extrabold", tone)}>
        {value}
        <span className="ml-0.5 text-xs font-medium text-muted-foreground">g</span>
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-primary/30 bg-white/60 px-6 py-16 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Utensils className="size-9" />
      </div>
      <h3 className="mt-6 text-xl font-bold">No meals logged today</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Snap your first meal to start tracking your daily nutrition.
      </p>
      <Button asChild className="mt-6 gap-2 shadow-sm" size="lg">
        <Link to="/">
          <Camera className="size-4" />
          Scan Meal
        </Link>
      </Button>
    </div>
  );
}
