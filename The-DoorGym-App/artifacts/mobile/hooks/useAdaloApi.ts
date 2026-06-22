import { useQuery } from "@tanstack/react-query";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api/adalo`;

async function adaloFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Adalo API error: ${res.status}`);
  return res.json() as Promise<T>;
}

// Adalo CDN base URL for image hashes
const ADALO_CDN = "https://adalo-uploads.imgix.net/";
// S3 bucket for uploaded video files
const ADALO_VIDEO_CDN = "https://proton-uploads-production.s3.amazonaws.com/";

export function adaloImageUrl(img: { url?: string | null; Url?: string | null } | null | undefined): string | null {
  if (!img) return null;
  const raw = img.url ?? img.Url ?? null;
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${ADALO_CDN}${raw}?auto=format&q=75`;
}

export function adaloVideoUrl(img: { url?: string | null; Url?: string | null } | null | undefined): string | null {
  if (!img) return null;
  const raw = img.url ?? img.Url ?? null;
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${ADALO_VIDEO_CDN}${raw}`;
}

// ─── Types ───────────────────────────────────────────────

export interface AdaloImage {
  url?: string | null;
  Url?: string | null;
  width?: number;
  height?: number;
  filename?: string;
}

export interface AdaloEducationItem {
  id: number;
  Name: string;
  "Display Name": string;
  Description: string;
  Thumbnail: AdaloImage;
  "YouTube Link": string;
  "Video File": AdaloImage;
  Instructions: string;
  "Education Categories": number[];
  Order: number;
}

export interface AdaloEducationCategory {
  id: number;
  Name: string;
  "Internal Name": string;
  "Library Type": string;
  "Show in the Library": boolean;
  Image: AdaloImage;
  Order: number;
  Videos: number[];
  "Education Library": number[];
}

export interface AdaloWorkoutName {
  id: number;
  Name: string;
  "Display Name": string;
  "Workout Type": string;
  Workouts: number[];
  Image: AdaloImage;
  Order: number;
}

export interface AdaloWorkout {
  id: number;
  Name: string;
  Description: string;
  "Sort Order": string;
  Image: AdaloImage;
  Videos: number[];
  "Circuit Videos": number[];
  "Workout Type": number[];
  Category: number[];
}

export interface AdaloVideo {
  id: number;
  Title: string;
  "Difficulty Level": number[];
  Categories: number[];
  "Education Categories": number[];
  Thumbnail: AdaloImage;
  "Video File": AdaloImage;
  VideoFile: string;
  Description: string;
  BodyPart: string;
  Order: number | null;
}

export interface AdaloExerciseCategory {
  id: number;
  Name: string;
  "Internal Name": string;
  "Library Type": string;
  Grouping: string | null;
  Image: AdaloImage;
  Videos: number[];
  Order: number;
  "Show in the Library": boolean;
}

export interface AdaloDifficultyLevel {
  id: number;
  Name: string;
  Image: AdaloImage;
  Videos: number[];
}

export interface AdaloSetupVideo {
  id: number;
  Name: string;
  "YouTube Link": string;
  "Video File": AdaloImage;
  "Thumbnail(Optional)": AdaloImage;
}

// ─── Hooks ───────────────────────────────────────────────

export function useEducationLibrary() {
  return useQuery({
    queryKey: ["education"],
    queryFn: () => adaloFetch<{ records: AdaloEducationItem[] }>("/education"),
    select: data => data.records.slice().sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0)),
  });
}

export function useEducationItem(id: number) {
  return useQuery({
    queryKey: ["education", id],
    queryFn: () => adaloFetch<AdaloEducationItem>(`/education/${id}`),
    enabled: !!id,
  });
}

export function useEducationCategories() {
  return useQuery({
    queryKey: ["education-categories"],
    queryFn: () => adaloFetch<{ records: AdaloEducationCategory[] }>("/education-categories"),
    select: data => data.records,
  });
}

export function useEducationCategoriesForItem(educationItemId: number) {
  return useQuery({
    queryKey: ["education-categories", "item", educationItemId],
    queryFn: () =>
      adaloFetch<{ records: AdaloEducationCategory[] }>(
        `/education-categories?educationItemId=${educationItemId}`
      ),
    select: data =>
      data.records.slice().sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0)),
    enabled: !!educationItemId,
  });
}

export function useWorkoutNames(workoutType?: string) {
  return useQuery({
    queryKey: ["workout-names", workoutType],
    queryFn: () =>
      adaloFetch<{ records: AdaloWorkoutName[] }>(
        `/workout-names${workoutType ? `?type=${encodeURIComponent(workoutType)}` : ""}`
      ),
    select: data => data.records.slice().sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0)),
  });
}

export function useAdaloWorkouts(typeId?: number) {
  return useQuery({
    queryKey: ["adalo-workouts", typeId],
    queryFn: () =>
      adaloFetch<{ records: AdaloWorkout[] }>(
        `/workouts${typeId !== undefined ? `?typeId=${typeId}` : ""}`
      ),
    select: data => data.records,
    enabled: typeId !== undefined,
  });
}

export function useAdaloWorkout(id: number) {
  return useQuery({
    queryKey: ["adalo-workout", id],
    queryFn: () => adaloFetch<AdaloWorkout>(`/workouts/${id}`),
    enabled: !!id,
  });
}

export function useVideos(categoryId?: number, educationCategoryId?: number) {
  const params = new URLSearchParams();
  if (categoryId !== undefined) params.set("categoryId", String(categoryId));
  if (educationCategoryId !== undefined) params.set("educationCategoryId", String(educationCategoryId));
  const query = params.toString();
  return useQuery({
    queryKey: ["videos", categoryId, educationCategoryId],
    queryFn: () => adaloFetch<{ records: AdaloVideo[] }>(`/videos${query ? `?${query}` : ""}`),
    select: data => data.records,
    enabled: categoryId !== undefined || educationCategoryId !== undefined,
  });
}

export function useVideo(id: number) {
  return useQuery({
    queryKey: ["video", id],
    queryFn: () => adaloFetch<AdaloVideo>(`/videos/${id}`),
    enabled: !!id,
  });
}

export function useExerciseCategories(libraryType?: string) {
  return useQuery({
    queryKey: ["exercise-categories", libraryType],
    queryFn: () =>
      adaloFetch<{ records: AdaloExerciseCategory[] }>(
        `/exercise-categories${libraryType ? `?libraryType=${encodeURIComponent(libraryType)}` : ""}`
      ),
    select: data =>
      data.records
        .filter(c => c["Show in the Library"])
        .slice()
        .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0)),
    enabled: !!libraryType,
  });
}

export function useDifficultyLevels() {
  return useQuery({
    queryKey: ["difficulty-levels"],
    queryFn: () => adaloFetch<{ records: AdaloDifficultyLevel[] }>("/difficulty-levels"),
    select: data => data.records,
  });
}

export function useSetupVideos() {
  return useQuery({
    queryKey: ["setup-videos"],
    queryFn: () => adaloFetch<{ records: AdaloSetupVideo[] }>("/setup-videos"),
    select: data => data.records.slice().sort((a, b) => a.id - b.id),
  });
}
