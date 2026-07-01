export type Meal = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  imageUrl?: string;
  loggedAt: number; // epoch ms
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
};

const KEY = "nutrisnap.meals.v1";

export function loadMeals(): Meal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Meal[]) : [];
  } catch {
    return [];
  }
}

export function saveMeals(meals: Meal[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(meals));
}

export function addMeal(meal: Meal) {
  const meals = loadMeals();
  meals.unshift(meal);
  saveMeals(meals);
}

export function isSameDay(a: number, b: number) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export const GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};
