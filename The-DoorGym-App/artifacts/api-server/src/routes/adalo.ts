import { Router } from "express";

const router = Router();

const ADALO_BASE = "https://api.adalo.com/v0/apps/3d819e28-0522-4a47-99f0-1d3b2d5b8b54";
const ADALO_API_KEY = process.env["ADALO_API_KEY"];

// Hardcoded Adalo collection IDs from technical documentation
const COLLECTIONS = {
  EDUCATION: "t_7jno5rsxknzmpb4kd1tylxbbu",
  EDUCATION_CATEGORIES: "t_dwbz6fc4ez38zy11pxe8wzmli",
  WORKOUT_NAMES: "t_dlmt45r94hqmqdjcc1r085vhw",
  WORKOUTS: "t_2dl41m0w1qmseomeg8c08p52i",
  VIDEOS: "t_8a5292fda6ce4580b6c78da83ec8bac2",
  EXERCISE_CATEGORIES: "t_0n6u0ucupytzk80vpuuy7olp1",
  DIFFICULTY_LEVELS: "t_60c043eadf7e429d81447d2be08e5e87",
  SETUP_VIDEOS: "t_9kgvjproxyr7yxj9urzxnp173",
};

async function adaloGet(collection: string, id?: string | number): Promise<unknown> {
  const path = id
    ? `${ADALO_BASE}/collections/${collection}/${id}`
    : `${ADALO_BASE}/collections/${collection}`;
  const response = await fetch(path, {
    headers: { Authorization: `Bearer ${ADALO_API_KEY}` },
  });
  if (!response.ok) throw new Error(`Adalo API error ${response.status}`);
  return response.json();
}

// ─── Sample data ─────────────────────────────────────────────

const SAMPLE_EDUCATION = [
  { id: 1, Name: "Core Stability", DisplayName: "Core Stability", Description: "Learn the fundamentals of core strength and stability for injury prevention.", Thumbnail: { Url: null }, "YouTube Link": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Video File": { Url: null }, Instructions: "Follow along with the exercises shown.", "Education Categories": [1, 2, 3, 4], Order: 2 },
  { id: 2, Name: "Shoulder Health", DisplayName: "Shoulder Health", Description: "Improve shoulder mobility and strength to prevent injury and enhance performance.", Thumbnail: { Url: null }, "YouTube Link": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Video File": { Url: null }, Instructions: "Complete 3 rounds of each movement.", "Education Categories": [5, 6, 7, 8], Order: 3 },
  { id: 3, Name: "Hip Mobility", DisplayName: "Hip Mobility", Description: "Unlock tight hips and improve your squat, deadlift, and overall movement quality.", Thumbnail: { Url: null }, "YouTube Link": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Video File": { Url: null }, Instructions: "Hold each stretch for 30–60 seconds.", "Education Categories": [9, 10, 11, 12], Order: 4 },
  { id: 4, Name: "Intro Video", DisplayName: "Watch First!", Description: "Welcome to the GymWorkout app! Watch this intro video before getting started.", Thumbnail: { Url: null }, "YouTube Link": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Video File": { Url: null }, Instructions: "Watch the full video before proceeding.", "Education Categories": [], Order: 1 },
];

const SAMPLE_EDUCATION_CATEGORIES = [
  { id: 1, Name: "Core Stability", "Internal Name": "ES", "Library Type": "ES", "Show in the Library": false, Image: null, Order: 1, Videos: [1, 2, 3], "Education Library": [1] },
  { id: 2, Name: "Core Stability", "Internal Name": "ES+", "Library Type": "ES+", "Show in the Library": false, Image: null, Order: 2, Videos: [1, 2, 3], "Education Library": [1] },
  { id: 3, Name: "Core Stability", "Internal Name": "FF", "Library Type": "FF", "Show in the Library": false, Image: null, Order: 3, Videos: [1, 2, 3], "Education Library": [1] },
  { id: 4, Name: "Core Stability", "Internal Name": "FF+", "Library Type": "FF+", "Show in the Library": false, Image: null, Order: 4, Videos: [1, 2, 3], "Education Library": [1] },
  { id: 5, Name: "Shoulder Health", "Internal Name": "ES", "Library Type": "ES", "Show in the Library": false, Image: null, Order: 1, Videos: [4, 5], "Education Library": [2] },
  { id: 6, Name: "Shoulder Health", "Internal Name": "ES+", "Library Type": "ES+", "Show in the Library": false, Image: null, Order: 2, Videos: [4, 5], "Education Library": [2] },
  { id: 7, Name: "Shoulder Health", "Internal Name": "FF", "Library Type": "FF", "Show in the Library": false, Image: null, Order: 3, Videos: [4, 5], "Education Library": [2] },
  { id: 8, Name: "Shoulder Health", "Internal Name": "FF+", "Library Type": "FF+", "Show in the Library": false, Image: null, Order: 4, Videos: [4, 5], "Education Library": [2] },
  { id: 9, Name: "Hip Mobility", "Internal Name": "ES", "Library Type": "ES", "Show in the Library": false, Image: null, Order: 1, Videos: [1, 2], "Education Library": [3] },
  { id: 10, Name: "Hip Mobility", "Internal Name": "ES+", "Library Type": "ES+", "Show in the Library": false, Image: null, Order: 2, Videos: [1, 2], "Education Library": [3] },
  { id: 11, Name: "Hip Mobility", "Internal Name": "FF", "Library Type": "FF", "Show in the Library": false, Image: null, Order: 3, Videos: [1, 2], "Education Library": [3] },
  { id: 12, Name: "Hip Mobility", "Internal Name": "FF+", "Library Type": "FF+", "Show in the Library": false, Image: null, Order: 4, Videos: [1, 2], "Education Library": [3] },
];

const SAMPLE_WORKOUT_NAMES = [
  { id: 1, Name: "Beginner", DisplayName: "Beginner", "Workout Type": "FF", Workouts: [1, 2], Image: { Url: null }, Order: 1 },
  { id: 2, Name: "Intermediate", DisplayName: "Intermediate", "Workout Type": "FF", Workouts: [3, 4], Image: { Url: null }, Order: 2 },
  { id: 3, Name: "Advanced", DisplayName: "Advanced", "Workout Type": "FF", Workouts: [5, 6], Image: { Url: null }, Order: 3 },
  { id: 4, Name: "Senior", DisplayName: "Senior / Low Impact", "Workout Type": "FF", Workouts: [7], Image: { Url: null }, Order: 4 },
  { id: 5, Name: "Beginner", DisplayName: "Beginner", "Workout Type": "FF+", Workouts: [1, 2], Image: { Url: null }, Order: 1 },
  { id: 6, Name: "Intermediate", DisplayName: "Intermediate", "Workout Type": "FF+", Workouts: [3, 4], Image: { Url: null }, Order: 2 },
  { id: 7, Name: "Advanced", DisplayName: "Advanced", "Workout Type": "FF+", Workouts: [5, 6], Image: { Url: null }, Order: 3 },
];

const SAMPLE_WORKOUTS = [
  { id: 1, Name: "Workout A ⬇️", Description: "A full-body resistance band workout targeting all major muscle groups. Perfect for building baseline strength.", Image: { Url: null }, "Sort Order": "1", Videos: [1, 2, 3], "Circuit Videos": [4, 5], "Workout Type": [5], Category: [1] },
  { id: 2, Name: "Workout B ⬇️", Description: "Upper body focused session combining pushing and pulling movements for balanced development.", Image: { Url: null }, "Sort Order": "2", Videos: [6, 7, 8], "Circuit Videos": [9, 10], "Workout Type": [5], Category: [1] },
  { id: 3, Name: "Workout C ⬇️", Description: "Lower body power workout with single-leg movements and hip hinge patterns.", Image: { Url: null }, "Sort Order": "3", Videos: [11, 12, 13], "Circuit Videos": [14, 15], "Workout Type": [5], Category: [1] },
  { id: 4, Name: "Workout A+ ⬇️", Description: "Enhanced full body workout with progressive overload for intermediate trainees.", Image: { Url: null }, "Sort Order": "1", Videos: [1, 2, 3, 4], "Circuit Videos": [5, 6], "Workout Type": [6], Category: [1] },
  { id: 5, Name: "Workout B+ ⬇️", Description: "Advanced upper body and core complex for Essential Strength Plus members.", Image: { Url: null }, "Sort Order": "2", Videos: [7, 8, 9], "Circuit Videos": [10, 11], "Workout Type": [6], Category: [1] },
  { id: 6, Name: "Core Stability FF", Description: "Build a strong stable core using Functional Fitness movements.", Image: { Url: null }, "Sort Order": "1", Videos: [1, 2, 3], "Circuit Videos": [4], "Workout Type": [1], Category: [2] },
  { id: 7, Name: "Full Body FF", Description: "Complete Functional Fitness full-body conditioning session.", Image: { Url: null }, "Sort Order": "2", Videos: [5, 6, 7], "Circuit Videos": [8, 9], "Workout Type": [1], Category: [2] },
  { id: 8, Name: "Strength Circuit", Description: "Senior-friendly low-impact strength circuit for all abilities.", Image: { Url: null }, "Sort Order": "1", Videos: [1, 2], "Circuit Videos": [3], "Workout Type": [4], Category: [3] },
];

const SAMPLE_VIDEOS = [
  { id: 1, Title: "Squat - Beginner", "Difficulty Level": [1], Categories: [1, 9], "Education Categories": [1, 2, 3, 4], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Stand with feet shoulder-width apart. Lower until thighs are parallel to floor. Drive through heels to return.", BodyPart: "Thighs", Order: 1 },
  { id: 2, Title: "Lunge - Beginner", "Difficulty Level": [1], Categories: [1, 9], "Education Categories": [1, 2, 3, 4], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Step forward, lower back knee toward floor. Push back to start. Alternate legs.", BodyPart: "Thighs", Order: 2 },
  { id: 3, Title: "Wall Sit - Beginner", "Difficulty Level": [1], Categories: [1, 9], "Education Categories": [], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Back against wall, lower to 90° knee angle. Hold position for time.", BodyPart: "Thighs", Order: 3 },
  { id: 4, Title: "Row - Beginner", "Difficulty Level": [1], Categories: [2, 10], "Education Categories": [5, 6, 7, 8], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "With band anchored overhead, pull elbows back and squeeze shoulder blades together.", BodyPart: "Back", Order: 1 },
  { id: 5, Title: "Lat Pull - Beginner", "Difficulty Level": [1], Categories: [2, 10], "Education Categories": [5, 6, 7, 8], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Pull band from overhead down to chest level, engaging lats. Control the return.", BodyPart: "Back", Order: 2 },
  { id: 6, Title: "Push-Up - Beginner", "Difficulty Level": [1], Categories: [3, 11], "Education Categories": [], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Plank position. Lower chest toward floor. Push back up. Keep core engaged throughout.", BodyPart: "Chest", Order: 1 },
  { id: 7, Title: "Chest Fly - Beginner", "Difficulty Level": [1], Categories: [3, 11], "Education Categories": [], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Arms wide, bring hands together in front of chest. Feel the stretch across pecs.", BodyPart: "Chest", Order: 2 },
  { id: 8, Title: "Shoulder Press - Beginner", "Difficulty Level": [1], Categories: [4, 12], "Education Categories": [], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Bands at shoulder height, press overhead. Lower under control.", BodyPart: "Shoulders", Order: 1 },
  { id: 9, Title: "Lateral Raise - Beginner", "Difficulty Level": [1], Categories: [4, 12], "Education Categories": [], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Arms at sides, raise to shoulder height. Lower with control. Don't shrug.", BodyPart: "Shoulders", Order: 2 },
  { id: 10, Title: "Bicep Curl - Beginner", "Difficulty Level": [1], Categories: [5, 13], "Education Categories": [], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Stand on band, curl hands toward shoulders. Squeeze biceps at top.", BodyPart: "Arms", Order: 1 },
  { id: 11, Title: "Hammer Curl - Beginner", "Difficulty Level": [1], Categories: [5, 13], "Education Categories": [], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Neutral grip curl. Targets brachialis and brachioradialis as well as biceps.", BodyPart: "Arms", Order: 2 },
  { id: 12, Title: "Tricep Extension - Beginner", "Difficulty Level": [1], Categories: [6, 14], "Education Categories": [], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Band anchored overhead, extend arms back. Keep elbows close to head.", BodyPart: "Arms", Order: 1 },
  { id: 13, Title: "Plank - Beginner", "Difficulty Level": [1], Categories: [15], "Education Categories": [], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Hold straight body position on forearms. Breathe steadily. Squeeze core.", BodyPart: "Core", Order: 1 },
  { id: 14, Title: "Squat - Intermediate", "Difficulty Level": [2], Categories: [1, 9], "Education Categories": [], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Add resistance band. Full depth squat with controlled tempo.", BodyPart: "Thighs", Order: 4 },
  { id: 15, Title: "Row - Intermediate", "Difficulty Level": [2], Categories: [2, 10], "Education Categories": [], Thumbnail: { Url: null }, "Video File": { Url: null }, Description: "Increase band tension. Pause at peak contraction for 2 counts.", BodyPart: "Back", Order: 3 },
];

const SAMPLE_EXERCISE_CATEGORIES_ES = [
  { id: 1, Name: "Thighs", "Library Type": "ES", Grouping: null, Image: { Url: null }, Videos: [1, 2, 3, 14], Order: 1, "Show in the Library": true },
  { id: 2, Name: "Back", "Library Type": "ES", Grouping: null, Image: { Url: null }, Videos: [4, 5, 15], Order: 2, "Show in the Library": true },
  { id: 3, Name: "Chest", "Library Type": "ES", Grouping: null, Image: { Url: null }, Videos: [6, 7], Order: 3, "Show in the Library": true },
  { id: 4, Name: "Shoulders", "Library Type": "ES", Grouping: null, Image: { Url: null }, Videos: [8, 9], Order: 4, "Show in the Library": true },
  { id: 5, Name: "Biceps", "Library Type": "ES", Grouping: null, Image: { Url: null }, Videos: [10, 11], Order: 5, "Show in the Library": true },
  { id: 6, Name: "Triceps", "Library Type": "ES", Grouping: null, Image: { Url: null }, Videos: [12], Order: 6, "Show in the Library": true },
];

const SAMPLE_EXERCISE_CATEGORIES_FF = [
  { id: 9, Name: "Thighs", "Library Type": "FF", Grouping: null, Image: { Url: null }, Videos: [1, 2, 3, 14], Order: 1, "Show in the Library": true },
  { id: 10, Name: "Back", "Library Type": "FF", Grouping: null, Image: { Url: null }, Videos: [4, 5, 15], Order: 2, "Show in the Library": true },
  { id: 11, Name: "Chest", "Library Type": "FF", Grouping: null, Image: { Url: null }, Videos: [6, 7], Order: 3, "Show in the Library": true },
  { id: 12, Name: "Shoulders", "Library Type": "FF", Grouping: null, Image: { Url: null }, Videos: [8, 9], Order: 4, "Show in the Library": true },
  { id: 13, Name: "Biceps", "Library Type": "FF", Grouping: null, Image: { Url: null }, Videos: [10, 11], Order: 5, "Show in the Library": true },
  { id: 14, Name: "Triceps", "Library Type": "FF", Grouping: null, Image: { Url: null }, Videos: [12], Order: 6, "Show in the Library": true },
  { id: 15, Name: "Core", "Library Type": "FF", Grouping: "G1", Image: { Url: null }, Videos: [13], Order: 7, "Show in the Library": true },
];

const SAMPLE_EXERCISE_CATEGORIES_ESPLUS = SAMPLE_EXERCISE_CATEGORIES_ES.map(c => ({ ...c, id: c.id + 20, "Library Type": "ES+" }));
const SAMPLE_EXERCISE_CATEGORIES_FFPLUS = SAMPLE_EXERCISE_CATEGORIES_FF.map(c => ({ ...c, id: c.id + 40, "Library Type": "FF+" }));
const ALL_EXERCISE_CATEGORIES = [
  ...SAMPLE_EXERCISE_CATEGORIES_ES,
  ...SAMPLE_EXERCISE_CATEGORIES_ESPLUS,
  ...SAMPLE_EXERCISE_CATEGORIES_FF,
  ...SAMPLE_EXERCISE_CATEGORIES_FFPLUS,
];

const SAMPLE_DIFFICULTY_LEVELS = [
  { id: 1, Name: "Beginner", Image: { Url: null }, Videos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  { id: 2, Name: "Intermediate", Image: { Url: null }, Videos: [14, 15] },
  { id: 3, Name: "Advanced", Image: { Url: null }, Videos: [] },
  { id: 4, Name: "Senior", Image: { Url: null }, Videos: [] },
];

const SAMPLE_SETUP_VIDEOS = [
  { id: 1, Name: "Setting up Essential Strength", "YouTube Link": "https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&modestbranding=1&rel=0&showinfo=0", "Video File": { Url: null }, "Thumbnail(Optional)": { Url: null } },
  { id: 2, Name: "Setting up Essential Strength Plus", "YouTube Link": "https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&modestbranding=1&rel=0&showinfo=0", "Video File": { Url: null }, "Thumbnail(Optional)": { Url: null } },
  { id: 3, Name: "Setting up Functional Fitness", "YouTube Link": "https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&modestbranding=1&rel=0&showinfo=0", "Video File": { Url: null }, "Thumbnail(Optional)": { Url: null } },
  { id: 4, Name: "Setting up Functional Fitness Plus", "YouTube Link": "https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&modestbranding=1&rel=0&showinfo=0", "Video File": { Url: null }, "Thumbnail(Optional)": { Url: null } },
];

// ─── Generic Adalo proxy helper ───────────────────────────────

async function proxyCollection(
  collection: string,
  fallback: unknown[],
  res: import("express").Response
) {
  if (!ADALO_API_KEY) {
    return res.json({ records: fallback });
  }
  try {
    const data = await adaloGet(collection) as { records?: unknown[] };
    return res.json({ records: data.records ?? fallback });
  } catch {
    return res.json({ records: fallback });
  }
}

async function proxyRecord(
  collection: string,
  id: string,
  fallback: unknown[],
  res: import("express").Response
) {
  const numId = parseInt(id, 10);
  if (!ADALO_API_KEY) {
    const item = fallback.find((r: unknown) => (r as Record<string, unknown>).id === numId);
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  }
  try {
    const data = await adaloGet(collection, id);
    return res.json(data);
  } catch {
    const item = fallback.find((r: unknown) => (r as Record<string, unknown>).id === numId);
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  }
}

// ─── Routes ──────────────────────────────────────────────────

// Education Library
router.get("/adalo/education", async (req, res) => {
  await proxyCollection(COLLECTIONS.EDUCATION, SAMPLE_EDUCATION, res);
});
router.get("/adalo/education/:id", async (req, res) => {
  await proxyRecord(COLLECTIONS.EDUCATION, req.params.id, SAMPLE_EDUCATION, res);
});

// Education Categories
router.get("/adalo/education-categories", async (req, res) => {
  const educationItemId = req.query["educationItemId"] ? Number(req.query["educationItemId"]) : undefined;
  if (!ADALO_API_KEY) {
    let records = SAMPLE_EDUCATION_CATEGORIES;
    if (educationItemId) records = records.filter(c => (c["Education Library"] as number[]).includes(educationItemId));
    return res.json({ records });
  }
  try {
    const data = await adaloGet(COLLECTIONS.EDUCATION_CATEGORIES) as { records?: Array<Record<string, unknown>> };
    let records = (data.records ?? SAMPLE_EDUCATION_CATEGORIES) as Array<Record<string, unknown>>;
    if (educationItemId) records = records.filter(c => {
      const el = c["Education Library"] as number[] | undefined;
      return Array.isArray(el) && el.includes(educationItemId);
    });
    return res.json({ records });
  } catch {
    let records = SAMPLE_EDUCATION_CATEGORIES as Array<Record<string, unknown>>;
    if (educationItemId) records = records.filter(c => {
      const el = c["Education Library"] as number[] | undefined;
      return Array.isArray(el) && el.includes(educationItemId);
    });
    return res.json({ records });
  }
});
router.get("/adalo/education-categories/:id", async (req, res) => {
  await proxyRecord(COLLECTIONS.EDUCATION_CATEGORIES, req.params.id, SAMPLE_EDUCATION_CATEGORIES, res);
});

// Workout Names (FF/FF+ difficulty levels)
router.get("/adalo/workout-names", async (req, res) => {
  const type = req.query["type"] as string | undefined;
  if (!ADALO_API_KEY) {
    const filtered = type
      ? SAMPLE_WORKOUT_NAMES.filter(w => w["Workout Type"] === type)
      : SAMPLE_WORKOUT_NAMES;
    return res.json({ records: filtered });
  }
  try {
    const data = await adaloGet(COLLECTIONS.WORKOUT_NAMES) as { records?: unknown[] };
    let records = data.records ?? SAMPLE_WORKOUT_NAMES;
    if (type) records = (records as Array<Record<string, unknown>>).filter(w => w["Workout Type"] === type);
    return res.json({ records });
  } catch {
    const filtered = type
      ? SAMPLE_WORKOUT_NAMES.filter(w => w["Workout Type"] === type)
      : SAMPLE_WORKOUT_NAMES;
    return res.json({ records: filtered });
  }
});

// Workouts (ES/ES+ sessions)
router.get("/adalo/workouts", async (req, res) => {
  const typeId = req.query["typeId"] ? Number(req.query["typeId"]) : undefined;
  if (!ADALO_API_KEY) {
    const filtered = typeId
      ? SAMPLE_WORKOUTS.filter(w => (w["Workout Type"] as number[]).includes(typeId))
      : SAMPLE_WORKOUTS;
    const sorted = [...filtered].sort((a, b) => {
      const aOrder = parseInt(a["Sort Order"] ?? "999", 10);
      const bOrder = parseInt(b["Sort Order"] ?? "999", 10);
      return (isNaN(aOrder) ? 999 : aOrder) - (isNaN(bOrder) ? 999 : bOrder);
    });
    return res.json({ records: sorted });
  }
  try {
    const data = await adaloGet(COLLECTIONS.WORKOUTS) as { records?: Array<Record<string, unknown>> };
    let records = data.records ?? SAMPLE_WORKOUTS;
    if (typeId) {
      records = records.filter(w => {
        const wt = w["Workout Type"] as number[] | undefined;
        return Array.isArray(wt) && wt.includes(typeId);
      });
    }
    records = [...records].sort((a, b) => {
      const aOrder = parseInt(String(a["Sort Order"] ?? "999"), 10);
      const bOrder = parseInt(String(b["Sort Order"] ?? "999"), 10);
      return (isNaN(aOrder) ? 999 : aOrder) - (isNaN(bOrder) ? 999 : bOrder);
    });
    return res.json({ records });
  } catch {
    const filtered = typeId
      ? SAMPLE_WORKOUTS.filter(w => (w["Workout Type"] as number[]).includes(typeId))
      : SAMPLE_WORKOUTS;
    return res.json({ records: filtered });
  }
});
router.get("/adalo/workouts/:id", async (req, res) => {
  await proxyRecord(COLLECTIONS.WORKOUTS, req.params.id, SAMPLE_WORKOUTS, res);
});

// Videos / Exercise Library Details
router.get("/adalo/videos", async (req, res) => {
  const categoryId = req.query["categoryId"] ? Number(req.query["categoryId"]) : undefined;
  const educationCategoryId = req.query["educationCategoryId"] ? Number(req.query["educationCategoryId"]) : undefined;
  if (!ADALO_API_KEY) {
    let records = SAMPLE_VIDEOS;
    if (categoryId) records = records.filter(v => (v.Categories as number[]).includes(categoryId));
    if (educationCategoryId) records = records.filter(v => (v["Education Categories"] as number[]).includes(educationCategoryId));
    return res.json({ records });
  }
  try {
    const data = await adaloGet(COLLECTIONS.VIDEOS) as { records?: Array<Record<string, unknown>> };
    let records = (data.records ?? SAMPLE_VIDEOS) as Array<Record<string, unknown>>;
    if (categoryId) records = records.filter(v => { const c = v["Categories"] as number[] | undefined; return Array.isArray(c) && c.includes(categoryId); });
    if (educationCategoryId) records = records.filter(v => { const c = v["Education Categories"] as number[] | undefined; return Array.isArray(c) && c.includes(educationCategoryId); });
    return res.json({ records });
  } catch {
    let records = SAMPLE_VIDEOS as Array<Record<string, unknown>>;
    if (categoryId) records = records.filter(v => { const c = v["Categories"] as number[] | undefined; return Array.isArray(c) && c.includes(categoryId); });
    return res.json({ records });
  }
});
router.get("/adalo/videos/:id", async (req, res) => {
  await proxyRecord(COLLECTIONS.VIDEOS, req.params.id, SAMPLE_VIDEOS, res);
});

// Exercise Library Categories
router.get("/adalo/exercise-categories", async (req, res) => {
  const libraryType = req.query["libraryType"] as string | undefined;
  if (!ADALO_API_KEY) {
    let records = ALL_EXERCISE_CATEGORIES;
    if (libraryType) records = records.filter(c => c["Library Type"] === libraryType && c["Show in the Library"]);
    records = [...records].sort((a, b) => a.Order - b.Order);
    return res.json({ records });
  }
  try {
    const data = await adaloGet(COLLECTIONS.EXERCISE_CATEGORIES) as { records?: Array<Record<string, unknown>> };
    let records = data.records ?? ALL_EXERCISE_CATEGORIES as unknown[];
    if (libraryType) {
      records = (records as Array<Record<string, unknown>>).filter(c => c["Library Type"] === libraryType && c["Show in the Library"]);
    }
    return res.json({ records });
  } catch {
    let records = ALL_EXERCISE_CATEGORIES as Array<Record<string, unknown>>;
    if (libraryType) records = records.filter(c => c["Library Type"] === libraryType);
    return res.json({ records });
  }
});

// Difficulty Levels
router.get("/adalo/difficulty-levels", async (req, res) => {
  await proxyCollection(COLLECTIONS.DIFFICULTY_LEVELS, SAMPLE_DIFFICULTY_LEVELS, res);
});

// Setup Videos
router.get("/adalo/setup-videos", async (req, res) => {
  if (!ADALO_API_KEY) {
    const sorted = [...SAMPLE_SETUP_VIDEOS].sort((a, b) => a.id - b.id);
    return res.json({ records: sorted });
  }
  try {
    const data = await adaloGet(COLLECTIONS.SETUP_VIDEOS) as { records?: unknown[] };
    return res.json({ records: data.records ?? SAMPLE_SETUP_VIDEOS });
  } catch {
    return res.json({ records: SAMPLE_SETUP_VIDEOS });
  }
});

export default router;
