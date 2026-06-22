---
name: Adalo API field names
description: Real Adalo API field names for The Door Gym app collections — they differ from camelCase
---

WorkoutNames collection: `"Display Name"` (with space, not DisplayName); `Name` is the short name
ExerciseCategories: `"Library Type"`, `"Internal Name"`, `"Show in the Library"`, Grouping for G1 sub-category
Videos: `VideoFile` (camelCase) holds the YouTube URL; `"Video File"` (with space) holds the MP4 hash object; `Thumbnail.url` is a hash (lowercase)
Images: All Adalo image urls are content-hash filenames (e.g. `abc123.jpg`); prepend `https://cdn.adalo.com/` to get the full URL
Workouts: Image.Url is capital U (inconsistent with other collections which use lowercase url)
EducationItems: `"YouTube Link"`, `"Education Categories"`, `Name`, `Instructions`, `Description`
SetupVideos: `"YouTube Link"`, `"Thumbnail(Optional)"`

**Why:** Adalo stores field names exactly as configured in the builder — spaces, capitalization preserved. TypeScript interfaces must use string literal keys like `item["Display Name"]`.

**How to apply:** Always check the raw API response via `curl localhost:80/api/adalo/<endpoint>` before assuming field names. Use `adaloImageUrl()` helper from `useAdaloApi.ts` for all image URLs.
