import { Router } from "express";

const router = Router();

const ADALO_BASE = "https://api.adalo.com/v0/apps";
const ADALO_APP_ID = process.env["ADALO_APP_ID"] ?? "3d819e28-0522-4a47-99f0-1d3b2d5b8b54";
const ADALO_API_KEY = process.env["ADALO_API_KEY"];
const COLLECTION_ID = process.env["ADALO_COLLECTION_CATEGORIES"];

const SAMPLE_CATEGORIES = [
  { id: "c1", name: "Full Body", image: null, workoutCount: 3 },
  { id: "c2", name: "Upper Body", image: null, workoutCount: 4 },
  { id: "c3", name: "Lower Body", image: null, workoutCount: 3 },
  { id: "c4", name: "Core", image: null, workoutCount: 2 },
  { id: "c5", name: "Cardio", image: null, workoutCount: 4 },
  { id: "c6", name: "Push", image: null, workoutCount: 3 },
  { id: "c7", name: "Pull", image: null, workoutCount: 3 },
  { id: "c8", name: "Flexibility", image: null, workoutCount: 2 },
];

function transformCategoryRecord(record: Record<string, unknown>) {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (record[k] !== undefined && record[k] !== null) return record[k];
    }
    return null;
  };
  return {
    id: String(get("id", "ID") ?? ""),
    name: String(get("Name", "name", "Category", "Title") ?? "Unnamed"),
    image: get("Image", "image", "Photo", "Icon") as string | null,
    workoutCount: Number(get("Workout Count", "workoutCount") ?? 0) || null,
  };
}

router.get("/categories", async (req, res) => {
  if (!COLLECTION_ID || !ADALO_API_KEY) {
    return res.json({ records: SAMPLE_CATEGORIES, offset: 0, nextOffset: null });
  }

  try {
    const url = `${ADALO_BASE}/${ADALO_APP_ID}/collections/${COLLECTION_ID}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${ADALO_API_KEY}` },
    });

    if (!response.ok) {
      return res.json({ records: SAMPLE_CATEGORIES, offset: 0, nextOffset: null });
    }

    const data = (await response.json()) as { records?: Record<string, unknown>[]; offset?: number; nextOffset?: number };
    const records = (data.records ?? []).map(transformCategoryRecord);
    res.json({ records, offset: data.offset ?? 0, nextOffset: data.nextOffset ?? null });
  } catch {
    res.json({ records: SAMPLE_CATEGORIES, offset: 0, nextOffset: null });
  }
});

export default router;
