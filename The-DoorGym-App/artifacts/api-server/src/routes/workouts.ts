import { Router } from "express";

const router = Router();

const ADALO_BASE = "https://api.adalo.com/v0/apps";
const ADALO_APP_ID = process.env["ADALO_APP_ID"] ?? "3d819e28-0522-4a47-99f0-1d3b2d5b8b54";
const ADALO_API_KEY = process.env["ADALO_API_KEY"];
const COLLECTION_ID = process.env["ADALO_COLLECTION_WORKOUTS"];

const SAMPLE_WORKOUTS = [
  { id: "1", name: "Full Body Blast", description: "Target all major muscle groups in one powerful session. Combines compound lifts for maximum calorie burn.", image: null, duration: 45, difficulty: "Intermediate", category: "Full Body", exerciseCount: 8, calories: 380 },
  { id: "2", name: "Upper Body Power", description: "Build strength and definition across chest, shoulders, back and arms with this focused upper-body session.", image: null, duration: 40, difficulty: "Advanced", category: "Upper Body", exerciseCount: 7, calories: 310 },
  { id: "3", name: "Leg Day Destroyer", description: "Sculpt strong legs and glutes with squats, lunges, and hip-hinge movements that leave nothing behind.", image: null, duration: 50, difficulty: "Advanced", category: "Lower Body", exerciseCount: 9, calories: 420 },
  { id: "4", name: "Core & Stability", description: "Strengthen your core, improve balance and reduce injury risk with this functional stability circuit.", image: null, duration: 30, difficulty: "Beginner", category: "Core", exerciseCount: 6, calories: 220 },
  { id: "5", name: "HIIT Cardio Burn", description: "Torch fat and boost your cardiovascular fitness with intense intervals alternating work and rest.", image: null, duration: 25, difficulty: "Intermediate", category: "Cardio", exerciseCount: 10, calories: 350 },
  { id: "6", name: "Push Day", description: "Classic push-focused workout building chest, shoulders and triceps with progressive overload principles.", image: null, duration: 45, difficulty: "Intermediate", category: "Push", exerciseCount: 7, calories: 300 },
  { id: "7", name: "Pull Day", description: "Complete back, biceps and rear-delt session designed to balance your push movements and improve posture.", image: null, duration: 45, difficulty: "Intermediate", category: "Pull", exerciseCount: 7, calories: 295 },
  { id: "8", name: "Morning Mobility", description: "Gentle active stretching and mobility flow to wake up the body, reduce stiffness and prepare for the day.", image: null, duration: 20, difficulty: "Beginner", category: "Flexibility", exerciseCount: 5, calories: 120 },
];

function transformWorkoutRecord(record: Record<string, unknown>) {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (record[k] !== undefined && record[k] !== null) return record[k];
    }
    return null;
  };
  return {
    id: String(get("id", "ID") ?? ""),
    name: String(get("Name", "name", "Title", "title", "Workout Name", "workout_name") ?? "Unnamed"),
    description: String(get("Description", "description", "Details", "details") ?? ""),
    image: get("Image", "image", "Photo", "photo", "Thumbnail") as string | null,
    duration: Number(get("Duration", "duration", "Duration (minutes)", "Time") ?? 30),
    difficulty: String(get("Difficulty", "difficulty", "Level", "level") ?? ""),
    category: String(get("Category", "category", "Type", "type") ?? ""),
    exerciseCount: Number(get("Exercise Count", "exerciseCount", "Exercises", "exercise_count") ?? 0),
    calories: Number(get("Calories", "calories", "Calories Burned") ?? 0) || null,
  };
}

router.get("/workouts", async (req, res) => {
  if (!COLLECTION_ID || !ADALO_API_KEY) {
    const { categoryId, limit, offset } = req.query;
    let records = SAMPLE_WORKOUTS;
    if (categoryId) records = records.filter(w => w.category === categoryId);
    const off = Number(offset) || 0;
    const lim = Number(limit) || 50;
    const page = records.slice(off, off + lim);
    return res.json({ records: page, offset: off, nextOffset: off + lim < records.length ? off + lim : null });
  }

  try {
    const params = new URLSearchParams();
    if (req.query.limit) params.set("limit", String(req.query.limit));
    if (req.query.offset) params.set("offset", String(req.query.offset));

    const url = `${ADALO_BASE}/${ADALO_APP_ID}/collections/${COLLECTION_ID}?${params}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${ADALO_API_KEY}` },
    });

    if (!response.ok) {
      return res.json({ records: SAMPLE_WORKOUTS, offset: 0, nextOffset: null });
    }

    const data = (await response.json()) as { records?: Record<string, unknown>[]; offset?: number; nextOffset?: number };
    const records = (data.records ?? []).map(transformWorkoutRecord);
    res.json({ records, offset: data.offset ?? 0, nextOffset: data.nextOffset ?? null });
  } catch {
    res.json({ records: SAMPLE_WORKOUTS, offset: 0, nextOffset: null });
  }
});

router.get("/workouts/:id", async (req, res) => {
  const { id } = req.params;

  if (!COLLECTION_ID || !ADALO_API_KEY) {
    const workout = SAMPLE_WORKOUTS.find(w => w.id === id);
    if (!workout) return res.status(404).json({ error: "Not found" });
    return res.json(workout);
  }

  try {
    const url = `${ADALO_BASE}/${ADALO_APP_ID}/collections/${COLLECTION_ID}/${id}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${ADALO_API_KEY}` },
    });
    if (!response.ok) return res.status(404).json({ error: "Not found" });
    const data = (await response.json()) as Record<string, unknown>;
    res.json(transformWorkoutRecord(data));
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
