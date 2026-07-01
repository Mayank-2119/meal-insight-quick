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
