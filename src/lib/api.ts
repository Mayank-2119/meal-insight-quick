const API_BASE = import.meta.env.VITE_API_URL || "https://mayank2119-nutrisnap-api.hf.space";

export type PredictionTop = { label: string; confidence: number };

export type Prediction = {
  food_label: string;
  confidence: number;
  top3: PredictionTop[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  health_score: number;
};

export async function predictFood(imageFile: File, portion: number = 1.0): Promise<Prediction> {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await fetch(`${API_BASE}/predict?portion=${portion}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Prediction failed");
  }

  return response.json();
}

export async function lookupNutrition(food: string, portion: number = 1.0): Promise<Prediction> {
  const url = `${API_BASE}/nutrition?food=${encodeURIComponent(food)}&portion=${portion}`;
  const response = await fetch(url);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Nutrition lookup failed");
  }
  const raw = await response.json();
  return {
    food_label: raw.food_label ?? food,
    confidence: raw.confidence ?? 1,
    top3: raw.top3 ?? [],
    nutrition: raw.nutrition ?? raw,
    health_score: raw.health_score ?? 0,
  };
}
