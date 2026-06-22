import { Router } from "express";

const router = Router();

const ADALO_BASE = "https://api.adalo.com/v0/apps";
const ADALO_APP_ID = process.env["ADALO_APP_ID"] ?? "3d819e28-0522-4a47-99f0-1d3b2d5b8b54";
const ADALO_API_KEY = process.env["ADALO_API_KEY"];
const COLLECTION_ID = process.env["ADALO_COLLECTION_EXERCISES"];

const SAMPLE_EXERCISES = [
  { id: "e1", name: "Barbell Squat", description: "The king of lower-body exercises. Targets quads, hamstrings, glutes and core simultaneously. Keep chest up and drive through heels.", image: null, muscleGroup: "Legs", sets: 4, reps: "8-10", duration: null, equipment: "Barbell", videoUrl: null },
  { id: "e2", name: "Bench Press", description: "Primary chest builder. Targets pectorals, front deltoids and triceps. Control the descent and press explosively.", image: null, muscleGroup: "Chest", sets: 4, reps: "8-12", duration: null, equipment: "Barbell", videoUrl: null },
  { id: "e3", name: "Deadlift", description: "Full-body compound movement. Builds raw strength across the posterior chain — glutes, hamstrings, back and traps.", image: null, muscleGroup: "Back", sets: 3, reps: "5-8", duration: null, equipment: "Barbell", videoUrl: null },
  { id: "e4", name: "Pull-Up", description: "Upper-body bodyweight classic. Develops a wide back and strong biceps. Focus on full range of motion.", image: null, muscleGroup: "Back", sets: 4, reps: "6-10", duration: null, equipment: "Pull-up Bar", videoUrl: null },
  { id: "e5", name: "Overhead Press", description: "Build powerful, rounded shoulders and strong triceps. A true test of upper-body pressing strength.", image: null, muscleGroup: "Shoulders", sets: 4, reps: "8-10", duration: null, equipment: "Barbell", videoUrl: null },
  { id: "e6", name: "Romanian Deadlift", description: "Isolates the hamstrings and glutes through a hip-hinge pattern. Excellent for posterior chain development.", image: null, muscleGroup: "Legs", sets: 3, reps: "10-12", duration: null, equipment: "Barbell", videoUrl: null },
  { id: "e7", name: "Dumbbell Row", description: "Unilateral back exercise for balanced development. Targets lats, rhomboids and rear delts.", image: null, muscleGroup: "Back", sets: 3, reps: "10-12", duration: null, equipment: "Dumbbell", videoUrl: null },
  { id: "e8", name: "Incline Dumbbell Press", description: "Targets the upper chest for a complete, full pectoral development. Use a controlled tempo.", image: null, muscleGroup: "Chest", sets: 3, reps: "10-12", duration: null, equipment: "Dumbbell", videoUrl: null },
  { id: "e9", name: "Lateral Raise", description: "Isolates the medial deltoid for wider, more defined shoulders. Use light weight and strict form.", image: null, muscleGroup: "Shoulders", sets: 4, reps: "12-15", duration: null, equipment: "Dumbbell", videoUrl: null },
  { id: "e10", name: "Plank", description: "Anti-extension core exercise that builds total core stability and endurance. Keep hips level and breathe.", image: null, muscleGroup: "Core", sets: 3, reps: null, duration: 60, equipment: "Bodyweight", videoUrl: null },
  { id: "e11", name: "Leg Press", description: "Machine-based quad and glute builder. Allows heavier loading than squats with less spinal stress.", image: null, muscleGroup: "Legs", sets: 4, reps: "10-15", duration: null, equipment: "Machine", videoUrl: null },
  { id: "e12", name: "Tricep Pushdown", description: "Cable isolation for triceps. Great pump movement for arm size and the finishing touch on any push day.", image: null, muscleGroup: "Arms", sets: 3, reps: "12-15", duration: null, equipment: "Cable", videoUrl: null },
  { id: "e13", name: "Barbell Curl", description: "Classic bicep mass builder. Supinate the wrists at the top and fully extend at the bottom.", image: null, muscleGroup: "Arms", sets: 3, reps: "10-12", duration: null, equipment: "Barbell", videoUrl: null },
  { id: "e14", name: "Face Pull", description: "Rear delt and rotator cuff health exercise. Counteracts the internal rotation from pressing movements.", image: null, muscleGroup: "Shoulders", sets: 3, reps: "15-20", duration: null, equipment: "Cable", videoUrl: null },
  { id: "e15", name: "Russian Twist", description: "Rotational core exercise targeting the obliques. Add weight for increased resistance.", image: null, muscleGroup: "Core", sets: 3, reps: "20", duration: null, equipment: "Bodyweight", videoUrl: null },
];

function transformExerciseRecord(record: Record<string, unknown>) {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (record[k] !== undefined && record[k] !== null) return record[k];
    }
    return null;
  };
  return {
    id: String(get("id", "ID") ?? ""),
    name: String(get("Name", "name", "Exercise Name", "Title") ?? "Unnamed"),
    description: String(get("Description", "description", "Instructions") ?? ""),
    image: get("Image", "image", "Photo", "Thumbnail") as string | null,
    muscleGroup: String(get("Muscle Group", "muscleGroup", "Muscle", "Category", "Body Part") ?? ""),
    sets: Number(get("Sets", "sets") ?? 0) || null,
    reps: String(get("Reps", "reps", "Repetitions") ?? "") || null,
    duration: Number(get("Duration", "duration", "Time (seconds)") ?? 0) || null,
    equipment: String(get("Equipment", "equipment") ?? "") || null,
    videoUrl: String(get("Video", "videoUrl", "Video URL", "Demo") ?? "") || null,
  };
}

router.get("/exercises", async (req, res) => {
  if (!COLLECTION_ID || !ADALO_API_KEY) {
    const { muscleGroup, limit, offset } = req.query;
    let records = SAMPLE_EXERCISES;
    if (muscleGroup && muscleGroup !== "All") {
      records = records.filter(e => e.muscleGroup === muscleGroup);
    }
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
      return res.json({ records: SAMPLE_EXERCISES, offset: 0, nextOffset: null });
    }

    const data = (await response.json()) as { records?: Record<string, unknown>[]; offset?: number; nextOffset?: number };
    const records = (data.records ?? []).map(transformExerciseRecord);
    res.json({ records, offset: data.offset ?? 0, nextOffset: data.nextOffset ?? null });
  } catch {
    res.json({ records: SAMPLE_EXERCISES, offset: 0, nextOffset: null });
  }
});

router.get("/exercises/:id", async (req, res) => {
  const { id } = req.params;

  if (!COLLECTION_ID || !ADALO_API_KEY) {
    const exercise = SAMPLE_EXERCISES.find(e => e.id === id);
    if (!exercise) return res.status(404).json({ error: "Not found" });
    return res.json(exercise);
  }

  try {
    const url = `${ADALO_BASE}/${ADALO_APP_ID}/collections/${COLLECTION_ID}/${id}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${ADALO_API_KEY}` },
    });
    if (!response.ok) return res.status(404).json({ error: "Not found" });
    const data = (await response.json()) as Record<string, unknown>;
    res.json(transformExerciseRecord(data));
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
