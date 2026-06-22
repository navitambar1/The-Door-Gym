---
name: Door Gym app architecture
description: Key architectural decisions for The Door Gym Expo app rebuild
---

Navigation: Pure Stack navigator (no tabs), root at app/index.tsx (Splash), WorkoutTypeProvider wraps all screens
Package selection: 4 packages (ES=typeId 5, ES+=6, FF/FF+=use WorkoutName collection for difficulty chooser)
Workout flow: ES/ES+ → /workout/list/[typeId] direct; FF/FF+ → /workout/ff → select difficulty → /workout/list/[typeId]
Video playback: expo-web-browser for YouTube (VideoFile field); expo-av/expo-video NOT installed
Adalo App ID: 3d819e28-0522-4a47-99f0-1d3b2d5b8b54
Collection IDs: hardcoded in artifacts/api-server/src/routes/adalo.ts
CDN: adaloImageUrl() helper in useAdaloApi.ts prepends https://cdn.adalo.com/ to relative image hashes
Colors: primary=#47B3DD (sky blue), primaryDark=#2E8BBF; white background throughout

**Why:** Original Adalo MAUI app uses drawer navigation and image grid layout — replicated with Stack + custom headers. Dark gym theme rejected in favor of original blue-and-white Door Gym branding.
