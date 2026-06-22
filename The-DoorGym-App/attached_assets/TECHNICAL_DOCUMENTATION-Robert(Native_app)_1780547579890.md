# The Door Gym – GYMWorkout App: Technical Documentation

**Document Type:** Handover & Delivery Reference  
**Platform:** .NET MAUI (Android primary)  
**App Version:** 6.0  
**App ID:** `com.gymapp.gymworkout`  
**Target Framework:** `net10.0-android36.0` (min SDK 28)  
**Date:** June 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack & Dependencies](#2-technology-stack--dependencies)
3. [Architecture Overview](#3-architecture-overview)
4. [Adalo Database Tables](#4-adalo-database-tables)
5. [API Endpoints Reference](#5-api-endpoints-reference)
6. [Navigation Flow](#6-navigation-flow)
7. [Screen-by-Screen Documentation](#7-screen-by-screen-documentation)
8. [Data Filtering, Sorting & Search Logic](#8-data-filtering-sorting--search-logic)
9. [Business Logic & Calculations](#9-business-logic--calculations)
10. [External Integrations & Services](#10-external-integrations--services)
11. [Global State Management](#11-global-state-management)
12. [Converters](#12-converters)
13. [Assumptions, Dependencies & Known Limitations](#13-assumptions-dependencies--known-limitations)

---

## 1. Project Overview

**The Door Gym** is a fitness mobile application built for users of the DoorGym home gym product. It provides:

- Guided workout programs across four package types (Essential Strength, Essential Strength Plus, Functional Fitness, Functional Fitness Plus)
- An exercise library with categorized video content
- An education library with instructional video content
- DoorGym hardware setup videos
- Direct link to the DoorGym e-commerce website

All content (workouts, exercises, videos, categories) is stored in and served from an **Adalo** backend database, accessed via the Adalo REST API.

---

## 2. Technology Stack & Dependencies

| Component | Technology / Version |
|---|---|
| Framework | .NET MAUI |
| Target | net10.0-android36.0 (min SDK 28) |
| Video Playback | CommunityToolkit.Maui.MediaElement 3.1.0 |
| MVVM Messaging | CommunityToolkit.Mvvm 8.4.0 |
| JSON Parsing | Newtonsoft.Json 13.0.4 |
| HTTP Client | System.Net.Http.HttpClient |
| Backend | Adalo (No-Code Backend) |
| CDN / Video Streaming | Cloudflare Stream (HLS, .m3u8) |
| Fonts | OpenSans (multiple weights), Material Icons, Font Awesome (Brands, Regular, Solid) |

---

## 3. Architecture Overview

The app follows the **MVVM (Model-View-ViewModel)** pattern:

```
View  (.xaml + .xaml.cs)
  ↕ binds to
ViewModel  (BaseViewModel subclasses)
  ↕ calls
Service  (RestService)
  ↕ HTTP
Adalo REST API
  ↕ stores
Models  (C# POCOs deserialized from JSON)
```

### Key Layers

- **`Service/RestService.cs`** — Singleton HTTP service. All API calls are made here. No server-side filtering — full collections are fetched and filtered client-side.
- **`ViewModel/`** — `BaseViewModel` implements `INotifyPropertyChanged`. Each screen that needs async data has its own ViewModel.
- **`View/`** — XAML pages with code-behind for navigation and UI events.
- **`Models/`** — Plain C# data transfer objects (DTOs) deserialized from Adalo JSON.
- **`Models/Constants.cs`** — Hardcoded Adalo API base URL and Bearer token.

### App Entry Points

```
App.xaml.cs
  └─ MainPage = Splash (ContentPage, no Shell)
       ├─ First-time user → NavigationPage(IntroVideo)
       └─ Returning user  → AppShell
```

---

## 4. Adalo Database Tables

All data is stored in Adalo. The API returns a `{ "records": [...] }` envelope for collection endpoints, or a flat object for single-record endpoints.

| Adalo Collection ID | C# Model | Purpose |
|---|---|---|
| `t_7jno5rsxknzmpb4kd1tylxbbu` | `EducationLibraryVM` | Education Library top-level items (topics/modules) |
| `t_dwbz6fc4ez38zy11pxe8wzmli` | `EducationCategory` | Education categories linking topics to exercise video sets by package type |
| `t_dlmt45r94hqmqdjcc1r085vhw` | `WorkoutName` | Workout difficulty/category names for Functional Fitness workouts |
| `t_2dl41m0w1qmseomeg8c08p52i` | `Workout` | Individual workout sessions (ES/ES+ — contain video ID arrays) |
| `t_8a5292fda6ce4580b6c78da83ec8bac2` | `ExerciseLibraryDetails` / `Video` | Shared video/exercise records. Used by Exercise Library, Workout Videos, and Education Videos |
| `t_0n6u0ucupytzk80vpuuy7olp1` | `ExerciseLibraryVM` | Exercise library category cards (groups of exercise videos) |
| `t_60c043eadf7e429d81447d2be08e5e87` | `DifficultyLevel` | Difficulty level definitions (Beginner, Intermediate, Advanced, Senior, etc.) |
| `t_9vyas8u7y2f08gxk08awkh8ax` | `WorkoutMasterName` | Workout master name labels (fetched but not currently displayed in the UI) |
| `t_9kgvjproxyr7yxj9urzxnp173` | `SetupVideoVM` | DoorGym hardware setup videos (YouTube embeds) |

### Table Relationships

```
EducationLibraryVM (t_7jno5rsxknzmpb4kd1tylxbbu)
    └─ has many EducationCategories (List<int> IDs)

EducationCategory (t_dwbz6fc4ez38zy11pxe8wzmli)
    ├─ belongs to EducationLibraryVM (List<int> EducationLibraryVM)
    ├─ LibraryType: "ES" | "ES+" | "FF" | "FF+"
    └─ has many Videos (List<int> — IDs into t_8a5292fda6ce4580b6c78da83ec8bac2)

ExerciseLibraryVM (t_0n6u0ucupytzk80vpuuy7olp1)
    ├─ LibraryType: "ES" | "ES+" | "FF" | "FF+"
    ├─ Grouping: "G1" or other
    └─ has many Videos (List<int>)

ExerciseLibraryDetails / Video (t_8a5292fda6ce4580b6c78da83ec8bac2)
    ├─ belongs to Categories (List<int> — ExerciseLibraryVM IDs)
    ├─ belongs to EducationCategories (List<int> — EducationCategory IDs)
    ├─ DifficultyLevel (List<int> — DifficultyLevel IDs)
    ├─ VideoFile: { Url, Size, Filename }
    └─ Thumbnail: { Url, ... }

Workout (t_2dl41m0w1qmseomeg8c08p52i)
    ├─ WorkoutType (List<int> — WorkoutName IDs or package IDs)
    ├─ Videos (List<int> — ordered regular video IDs)
    └─ CircuitVideos (List<int> — ordered circuit video IDs)

WorkoutName (t_dlmt45r94hqmqdjcc1r085vhw)
    └─ WorkoutType: "FF" | "FF+"

DifficultyLevel (t_60c043eadf7e429d81447d2be08e5e87)
    └─ Videos (List<int>)

SetupVideoVM (t_9kgvjproxyr7yxj9urzxnp173)
    └─ YouTubeLink (string — YouTube embed URL)
```

---

## 5. API Endpoints Reference

**Base URL:** `https://api.adalo.com/v0/apps/3d819e28-0522-4a47-99f0-1d3b2d5b8b54/`  
**Authentication:** Bearer token in `Authorization` header  
**Token:** `ehhqnffmrvew4diazu17rifzy` (hardcoded in `Models/Constants.cs`)

All requests are HTTP GET. No POST/PUT/DELETE calls are made from the app.

### Standard Response Envelope (Collection)

```json
{
  "records": [ { ...record... }, { ...record... } ]
}
```

### Single Record Response (by ID)

```json
{ ...flat record fields... }
```

---

### Endpoint 1 — Education Library

```
GET /collections/t_7jno5rsxknzmpb4kd1tylxbbu
GET /collections/t_7jno5rsxknzmpb4kd1tylxbbu/{id}
```

**Response record fields:**

```json
{
  "id": 8,
  "Name": "string",
  "DisplayName": "string",
  "Thumbnail": { "Url": "string", "Size": 0, "Width": 0, "Height": 0, "Filename": "string" },
  "Description": "string",
  "YouTube Link": "https://...",
  "Instructions": "string",
  "Exercises Data": "string",
  "Order": 1,
  "Education Categories": [12, 34],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### Endpoint 2 — Education Categories

```
GET /collections/t_dwbz6fc4ez38zy11pxe8wzmli
```

**Response record fields:**

```json
{
  "id": 12,
  "Name": "string",
  "InternalName": "string",
  "Show in the Library": true,
  "Library Type": "ES",
  "Image": { "Url": "string" },
  "Order": 1,
  "Videos": [101, 102, 103],
  "Education Library": [8]
}
```

---

### Endpoint 3 — WorkoutName (FF/FF+ difficulty/category labels)

```
GET /collections/t_dlmt45r94hqmqdjcc1r085vhw
```

**Response record fields:**

```json
{
  "id": 1,
  "DisplayName": "string",
  "Name": "Beginner",
  "Workout Type": "FF",
  "Workouts": [201, 202],
  "Image": { "Url": "string" },
  "Order": 1,
  "created_at": "...",
  "updated_at": "..."
}
```

---

### Endpoint 4 — Workouts (ES/ES+ sessions)

```
GET /collections/t_2dl41m0w1qmseomeg8c08p52i
GET /collections/t_2dl41m0w1qmseomeg8c08p52i/{id}
```

**Response record fields:**

```json
{
  "id": 201,
  "Name": "Workout A ⬇️",
  "Description": "string",
  "Sort Order": "3",
  "Image": { "Url": "string" },
  "Videos": [301, 302],
  "Circuit Videos": [303, 304],
  "Workout Type": [5],
  "Category": [1],
  "created_at": "...",
  "updated_at": "..."
}
```

---

### Endpoint 5 — Exercise Library Details / Videos (shared)

```
GET /collections/t_8a5292fda6ce4580b6c78da83ec8bac2
GET /collections/t_8a5292fda6ce4580b6c78da83ec8bac2/{id}
```

**Response record fields:**

```json
{
  "id": 301,
  "Title": "Squat - Beginner",
  "Difficulty Level": [1],
  "Categories": [10],
  "Education Categories": [12],
  "Thumbnail": { "Url": "string", "Size": 0, "Width": 0, "Height": 0, "Filename": "string" },
  "Video File": { "Url": "https://...", "Size": 0, "Filename": "string" },
  "Description": "string",
  "BodyPart": "Legs",
  "Order": 1,
  "Next Video": "string",
  "Previous Video": "string",
  "created_at": "...",
  "updated_at": "..."
}
```

---

### Endpoint 6 — Exercise Library Categories

```
GET /collections/t_0n6u0ucupytzk80vpuuy7olp1
```

**Response record fields:**

```json
{
  "id": 10,
  "Name": "Lower Body",
  "Library Type": "ES",
  "Grouping": "G1",
  "Image": { "Url": "string" },
  "Videos": [301, 302],
  "Order": 2,
  "Show in the Library": true,
  "created_at": "...",
  "updated_at": "..."
}
```

---

### Endpoint 7 — Difficulty Levels

```
GET /collections/t_60c043eadf7e429d81447d2be08e5e87
```

**Response record fields:**

```json
{
  "id": 1,
  "Name": "Beginner",
  "Image": { "Url": "string" },
  "Videos": [301],
  "created_at": "...",
  "updated_at": "..."
}
```

---

### Endpoint 8 — Workout Master Names

```
GET /collections/t_9vyas8u7y2f08gxk08awkh8ax
```

**Response record fields:**

```json
{
  "id": 1,
  "Workout Code": "ES",
  "Name": "Essential Strength",
  "Image": { "Url": "string" },
  "Orders": 1,
  "created_at": "...",
  "updated_at": "..."
}
```

---

### Endpoint 9 — Setup Videos

```
GET /collections/t_9kgvjproxyr7yxj9urzxnp173
```

**Response record fields:**

```json
{
  "id": 1,
  "Name": "How to Set Up Your Door Gym",
  "YouTube Link": "https://www.youtube.com/embed/...",
  "Thumbnail(Optional)": { "Url": "string" },
  "created_at": "...",
  "updated_at": "..."
}
```

---

## 6. Navigation Flow

### First-Time User

```
Splash (2s delay)
  └─ IntroVideo (Cloudflare HLS)
       ├─ Skip button ──────────┐
       └─ Video ends ──────────→ Disclaimer (I Agree checkbox)
                                     └─ "I Agree" → sets HasSeenIntro=true
                                           └─ Package (select workout type)
                                                └─ → Dashboard
```

### Returning User

```
Splash (2s delay)
  ├─ WorkoutType saved → Dashboard
  └─ No WorkoutType    → Package → Dashboard
```

### Dashboard Navigation (Main Hub)

```
Dashboard
  ├─ Flyout Menu (hamburger)
  │    ├─ Home              → Dashboard
  │    ├─ App Instructions  → AppInstruction
  │    ├─ Education         → EducationLibrary
  │    ├─ Select Package    → Package
  │    ├─ Start Workout     → StartWorkoutRouterPage (routes by saved WorkoutType)
  │    ├─ DoorGym Setup     → SetupVideo
  │    └─ Shop Website      → Opens thedoorgym.com in system browser
  │
  ├─ Education button        → EducationLibrary (Shell route)
  ├─ Exercise Library button → ExerciseLibraryEssentialStrength(savedWorkoutType)
  ├─ Start Workout button    → (routes by saved WorkoutType — see below)
  ├─ DoorGym Setup button    → SetupVideo
  └─ Shop Now                → Opens thedoorgym.com in system browser
```

### Start Workout Routing (by WorkoutType)

```
WorkoutType == "ES"  → StartWorkoutEssentialStrengthLibrary(id=5, "ES")
WorkoutType == "ES+" → StartWorkoutEssentialStrengthLibrary(id=6, "ES+")
WorkoutType == "FF"  → StartWorkoutFunctionFitnessLibrary("FF")
WorkoutType == "FF+" → StartWorkoutFunctionFitnessLibrary("FF+")
```

### ES / ES+ Workout Flow

```
StartWorkoutEssentialStrengthLibrary
  (fetches Workouts filtered by WorkoutType ID 5 or 6, sorted by SortOrder)
  └─ tap workout card
       └─ StartWorkoutEssentialStrengthLibraryDetail (shows name + description)
            └─ "Start" button
                 └─ StartWorkoutEssentialStrengthLibraryDetailVideo
                      (plays regular videos then circuit videos in sequence)
```

### FF / FF+ Workout Flow

```
StartWorkoutFunctionFitnessLibrary
  (shows WorkoutName list filtered by "FF" or "FF+", sorted by Order)
  └─ tap difficulty/category card
       └─ StartWorkoutEssentialStrengthLibrary(selectedId, selectedWorkoutType, selectedDisplayName)
            └─ [same as ES/ES+ flow from here]
```

### Exercise Library Flow

```
ExerciseLibraryEssentialStrength(workoutType)
  (fetches ExerciseLibraryVM filtered by LibraryType + ShowInTheLibrary, sorted by Order)
  (splits into main list [Grouping != G1] and filtered list [Grouping == G1])
  └─ tap exercise category card
       └─ ExerciseLibraryEssentialStrengthVideo(id, pageTitle, displayName)
            (fetches ExerciseLibraryDetails filtered by Categories.Contains(id))
            (sorted: grouped by DifficultyLevel descending, then Title A-Z)
            (auto-plays first video; sidebar list; prev/next; fullscreen)
```

### Education Library Flow

```
EducationLibrary
  (fetches all EducationLibraryVM, sorted by Order)
  └─ tap item (info button)
       └─ EducationLibraryDetail(id, displayName, youtubeLink, openFullScreenOnly)
            │  (if openFullScreenOnly [Order==1]: plays video full-screen immediately)
            │  (shows thumbnail + instructions)
            └─ tap package button (ES / ES+ / FF / FF+)
                 └─ EducationLibraryDetailVideo(educationId, displayName, educationType)
                      1. Fetches EducationCategory matching (educationId + educationType)
                      2. Fetches ExerciseLibraryDetails filtered by EducationCategory.Videos
                      3. Orders by EducationCategory.Videos index
                      (auto-plays first; sidebar list; prev/next; fullscreen; timer)
```

### Setup Video Flow

```
SetupVideo
  (fetches SetupVideoVM list, sorted by Id)
  └─ tap video card → plays full-screen using YouTube embed URL
```

---

## 7. Screen-by-Screen Documentation

---

### 7.1 Splash Screen

**File:** `View/Splash.xaml` + `View/Splash.xaml.cs`  
**Type:** ContentPage (outside Shell)

**Purpose:** App entry point. Displays brand splash while checking first-run state.

**Logic:**
1. Waits 2 seconds (`Task.Delay(2000)`)
2. Reads `HasSeenIntro` from `Preferences` (default: `false`)
3. If `false` → replaces `MainPage` with `NavigationPage(new IntroVideo())`
4. If `true` → replaces `MainPage` with `AppShell`, then navigates:
   - If `WorkoutType` preference is empty → `//Package`
   - Otherwise → `//Dashboard`
5. Handles legacy case where `WorkoutType` was stored as an integer (clears and re-prompts)

**Data Fetched:** None  
**Navigation:** → IntroVideo (first run) | → Package | → Dashboard

---

### 7.2 Intro Video Screen

**File:** `View/IntroVideo.xaml` (namespace: `DoorGym.View`)  
**Type:** ContentPage (inside NavigationPage, no Shell)

**Purpose:** Full-screen brand intro video for first-time users.

**Video Source:** Cloudflare Stream HLS  
`https://customer-f0bg00h3x7zvd1r0.cloudflarestream.com/4310f79c48c751a058e5a6a70f65019a/manifest/video.m3u8`

**Logic:**
- Loads and plays video via `CommunityToolkit.Maui.MediaElement`
- Loader shown until first frame is detected (150ms polling timer watches `Position > 200ms`)
- `OnMediaEnded` and "Skip" button both call `StopVideo()` then navigate to `Disclaimer`
- Screen kept on via `DeviceDisplay.KeepScreenOn = true`
- Status bar hidden on Android/iOS; NavBar hidden

**Data Fetched:** None (hardcoded URL)  
**Navigation:** → Disclaimer (on end or skip)

---

### 7.3 Disclaimer Screen

**File:** `View/Disclaimer.xaml` (namespace: `DoorGym.View`)  
**Type:** ContentPage

**Purpose:** Legal agreement screen. Must be accepted before accessing the app.

**UI Elements:**
- Disclaimer text
- Checkbox (`AgreeCheckbox`)
- "I Agree" button

**Logic:**
- If checkbox not checked → shows alert `"You must agree to the terms to continue."`
- If checked:
  - Sets `Preferences.Set("HasSeenIntro", true)`
  - Replaces `MainPage` with `AppShell`
  - Waits 50ms for Shell to initialize
  - If `WorkoutType` exists → `//Dashboard`; else → `//Package`

**Data Fetched:** None  
**Navigation:** → Package | → Dashboard

---

### 7.4 Package Selection Screen

**File:** `View/Package.xaml` + `View/Package.xaml.cs`  
**Type:** ContentPage (Shell route: `//Package`)

**Purpose:** Allows user to select their workout package. Selection is persisted and controls all subsequent content filtering throughout the app.

**Package Options & Codes:**

| Button Label | Stored Code | Numeric ID (for Workout filter) |
|---|---|---|
| Essential Strength | `ES` | 5 |
| Essential Strength Plus | `ES+` | 6 |
| Functional Fitness | `FF` | — |
| Functional Fitness Plus | `FF+` | — |

**Logic:**
- Each button calls `SaveWorkoutAndGo(type)`:
  1. `Preferences.Set("WorkoutType", type)`
  2. Navigates to `//Dashboard`

**Data Fetched:** None  
**Navigation:** → Dashboard

---

### 7.5 Dashboard Screen

**File:** `View/Dashboard.xaml` + `View/Dashboard.xaml.cs`  
**Type:** ContentPage (Shell route: `//Dashboard`)

**Purpose:** Central hub of the app. Entry point to all major features.

**OnAppearing Logic:**
- Reads `WorkoutType` preference; if empty/corrupt → redirects to `//Package`

**Button Handlers:**

| Button | Action |
|---|---|
| Education | `Shell.GoToAsync("//EducationLibrary")` |
| Exercise Library | Reads `WorkoutType` → `Navigation.PushAsync(new ExerciseLibraryEssentialStrength(workoutType))` |
| Start Workout | Routes by `WorkoutType`: ES/ES+ → `StartWorkoutEssentialStrengthLibrary`; FF/FF+ → `StartWorkoutFunctionFitnessLibrary` |
| DoorGym Setup | `Shell.GoToAsync("//SetupVideo")` |
| Shop Now | `Launcher.OpenAsync("https://thedoorgym.com/")` |
| Hamburger (☰) | `Shell.Current.FlyoutIsPresented = true` |

**Data Fetched:** None  
**Navigation:** Multiple (see above)

---

### 7.6 App Instruction Screen

**File:** `View/AppInstruction.xaml` + `View/AppInstruction.xaml.cs`  
**Type:** ContentPage (Shell route: `//AppInstruction`)

**Purpose:** Static informational page explaining how to use the app.

**Data Fetched:** None (static content in XAML)  
**Navigation:** Back → `//Dashboard`

---

### 7.7 Education Library Screen

**File:** `View/EducationLibrary.xaml` + `View/EducationLibrary.xaml.cs`  
**ViewModel:** `EducationLibraryViewModel`  
**Type:** ContentPage (Shell route: `//EducationLibrary`)

**Purpose:** Displays a scrollable list of education topic cards (e.g., exercise technique guides, warm-up routines).

**Data Fetched:**
- `GET /collections/t_7jno5rsxknzmpb4kd1tylxbbu`
- All records fetched; sorted by `Order` property ascending
- No package-type filtering at this level — all education items shown

**UI Elements:**
- List/collection of education cards
- Each card: thumbnail, display name, description, info button

**Item Tap Logic (`Description_Clicked`):**
- Gets the tapped `EducationLibraryVM` item from `CommandParameter`
- `openFullScreenOnly = (item.Order == 1)` — the first item opens directly as a full-screen video
- Navigates to `EducationLibraryDetail(item.Id, item.DisplayName, item.YouTubeLink, openFullScreenOnly)`

**Internet Check:** Yes — shows alert and returns if offline  
**Navigation:** → EducationLibraryDetail

---

### 7.8 Education Library Detail Screen

**File:** `View/EducationLibraryDetail.xaml` + `View/EducationLibraryDetail.xaml.cs`  
**Type:** ContentPage (pushed via Navigation.PushAsync)

**Purpose:** Shows details for a selected education topic. Provides a thumbnail the user can tap to watch the intro video, and four package-type buttons to enter the exercise video player for that topic.

**Constructor Parameters:**
- `int educationId` — ID of the education library item
- `string displayName` — display title
- `string videoUrl` — YouTube link from the education item
- `bool openFullScreenOnly` — if true, page starts in full-screen video mode

**Data Fetched:**
- `GET /collections/t_7jno5rsxknzmpb4kd1tylxbbu/{educationId}`
- Returns: thumbnail URL, instructions text, YouTube link

**Full-Screen Mode (when `openFullScreenOnly == true`):**
- Page content immediately hidden
- Video overlay shown
- Status bar and NavBar hidden
- Video plays automatically from `videoUrl`
- On close/end → navigates to `//EducationLibrary`

**Thumbnail Click (`OnThumbnailClicked`):**
- Plays `educationItem.YouTubeLink` in a full-screen overlay using `MediaElement`
- Hides page content, shows overlay

**Package Buttons (ES / ES+ / FF / FF+):**
- Navigate to `EducationLibraryDetailVideo(educationId, displayName, packageType)`

**Video lifecycle:**
- `OnDisappearing`: pauses and clears `FullScreenMediaElement`, restores status bar and NavBar
- Uses `WeakReferenceMessenger` to receive `"PauseVideo"` when app goes to background

**Navigation:** → EducationLibraryDetailVideo | Back → `//EducationLibrary`

---

### 7.9 Education Library Detail Video Screen

**File:** `View/EducationLibraryDetailVideo.xaml.cs`  
**Type:** ContentPage (pushed via Navigation.PushAsync)

**Purpose:** Full video player for an education topic filtered by package type. Includes a horizontal scrollable sidebar of exercises and a main video area.

**Constructor Parameters:**
- `int id` — education library item ID
- `string BannerTitle` — topic display name
- `string educationType` — package code ("ES", "ES+", "FF", "FF+")

**Data Fetch Sequence:**

**Step 1:** Find EducationCategory
```
GET /collections/t_dwbz6fc4ez38zy11pxe8wzmli
→ Filter: EducationLibraryVM.Contains(id) AND LibraryType == educationType
→ Sort by Order; take first match
```

**Step 2:** Load Exercise Videos
```
GET /collections/t_8a5292fda6ce4580b6c78da83ec8bac2
→ Filter: EducationCategories.Contains(educationCategory.Id)
→ Cross-reference with educationCategory.Videos (ordered list of IDs)
→ Keep only videos that appear in educationCategory.Videos
→ Preserve original order from educationCategory.Videos list
```

**Step 3:** Load Difficulty Levels
```
GET /collections/t_60c043eadf7e429d81447d2be08e5e87
→ Used to display difficulty names alongside each exercise
```

**UI Features:**
- Horizontal `CollectionView` sidebar listing all exercises (with `IsSelected` highlighting)
- Main `MediaElement` video player
- Fullscreen overlay (`fullscreenOverlay`) with a separate `fullscreenMedia` player
- Timer label (counts up from 00:00, resets on video change)
- Previous / Next buttons (circular navigation — wraps around)
- Loading indicator overlay during video changes

**Video Navigation:**
- Tap sidebar item → `LoadAndPlayVideoAsync(exerciseId)` (uses cache, cancels previous load)
- Next/Prev buttons → `HandleVideoChange(±1)` → `LoadExerciseByIndexAsync(newIndex)`
- Navigation is circular: after last item wraps back to first
- Cache: `Dictionary<int, ExerciseLibraryDetails> _exerciseCache` — avoids re-fetching
- Preloads adjacent videos (next + prev) after each selection

**Fullscreen Logic:**
- Entering: copies `mediaElement.Source` to `fullscreenMedia`, hides nav bar, hides status bar
- Exiting: stops `fullscreenMedia`, restores nav bar and status bar, resumes `mediaElement`
- Android: uses `SystemUiFlags.HideNavigation | Fullscreen | ImmersiveSticky`
- iOS: hides `UIApplication.StatusBarHidden`

**Internet Handling:**
- `CheckInternetConnection()`: waits 1.5s for network to stabilize before checking
- Shows alert once per disconnection event; does not navigate away

**Navigation:** Back (Pop) → EducationLibraryDetail

---

### 7.10 Exercise Library Router Screen

**File:** `View/ExerciseLibrary.xaml.cs`  
**Note:** This file is **excluded from compilation** in the `.csproj`. It exists in source but is not compiled. The Exercise Library is accessed via the Dashboard button directly, which calls `ExerciseLibraryEssentialStrength(workoutType)`.

---

### 7.11 Exercise Library Screen (Category List)

**File:** `View/ExerciseLibraryEssentialStrength.xaml` + `View/ExerciseLibraryEssentialStrength.xaml.cs`  
**ViewModel:** `ExerciseLibraryViewModel`  
**Type:** ContentPage (pushed via Navigation.PushAsync)

**Purpose:** Displays exercise category cards for the selected package type.

**Constructor Parameters:**
- `string libraryType` — package code ("ES", "ES+", "FF", "FF+")

**Data Fetched:**
- `GET /collections/t_0n6u0ucupytzk80vpuuy7olp1`
- Filter: `LibraryType == libraryType` AND `ShowInTheLibrary == true`
- Sort: by `Order` (ascending, invalid/missing Order pushed to bottom)

**Data Split (in ViewModel):**
- `Exercises` (main list): items where `Grouping != "G1"`
- `FilteredExercises` (secondary list): items where `Grouping == "G1"`
- `IsExerciseVisible`: true only if `FilteredExercises` has items
- `FilteredExerciseIds`: list of IDs from FilteredExercises (available for downstream use)

**Page Titles by Package:**

| Package | PageTitle | DisplayName |
|---|---|---|
| ES | Essential Strength | Library |
| ES+ | Essential Strength Plus | Exercise Library |
| FF+ | Functional Fitness Plus | Exercise Library |
| FF (default) | Functional Fitness | Exercise Library |

**Item Tap (`openDetailpage`):**
- Gets `ExerciseLibraryVM` from binding context
- Navigates to `ExerciseLibraryEssentialStrengthVideo(id, pageTitle, displayName)`

**Navigation:** → ExerciseLibraryEssentialStrengthVideo | Back → `//Dashboard`

---

### 7.12 Exercise Library Video Screen

**File:** `View/ExerciseLibraryEssentialStrengthVideo.xaml.cs`  
**Type:** ContentPage (pushed via Navigation.PushAsync)

**Purpose:** Full video player for a selected exercise category. Shows all exercise videos for that category in a scrollable sidebar with a main player area.

**Constructor Parameters:**
- `int ids` — the ExerciseLibraryVM category ID
- `string BannerTitle` — page header (package title)
- `string BannerSubTitle` — page sub-header (display name)

**Data Fetch Sequence:**

**Step 1:** Difficulty Levels
```
GET /collections/t_60c043eadf7e429d81447d2be08e5e87
→ All difficulty levels (used for display and sorting)
```

**Step 2:** Exercise Videos
```
GET /collections/t_8a5292fda6ce4580b6c78da83ec8bac2
→ Filter: Categories.Contains(ids)
→ Sort: Group by DifficultyLevel.Min() descending,
         then by Title A-Z within each group
```

**Sorting Algorithm (within `LoadExerciseLibraryDetailDataAsync`):**
```csharp
.GroupBy(ex => ex.DifficultyLevel?.Any() == true
    ? ex.DifficultyLevel.Min()
    : int.MaxValue)
.OrderByDescending(g => g.Key)   // highest difficulty ID first
.SelectMany(g => g.OrderBy(ex => ex.Title))  // A-Z within group
```

**Features:** Same as `EducationLibraryDetailVideo` — sidebar, player, fullscreen, timer, prev/next (circular), cache, preloading, internet checking.

**Navigation:** Back (Pop) → ExerciseLibraryEssentialStrength

---

### 7.13 Start Workout Router Screen

**File:** `View/StartWorkoutRouterPage.xaml` + `View/StartWorkoutRouterPage.xaml.cs`  
**Type:** ContentPage (Shell route: `//StartWorkoutRouterPage`, flyout item "Start Workout")

**Purpose:** Reads saved `WorkoutType` and redirects to the appropriate workout listing page. Acts as a stateless router — no visible content.

**Logic (OnAppearing, runs only once per visit):**

| WorkoutType | Navigates To |
|---|---|
| `ES` | `StartWorkoutEssentialStrengthLibrary(5, "ES", "")` |
| `ES+` | `StartWorkoutEssentialStrengthLibrary(6, "ES+", "")` |
| `FF` | `StartWorkoutFunctionFitnessLibrary("FF")` |
| `FF+` | `StartWorkoutFunctionFitnessLibrary("FF+")` |
| empty | `//SelectPackage` |

**Navigation:** → StartWorkoutEssentialStrengthLibrary | → StartWorkoutFunctionFitnessLibrary

---

### 7.14 Start Workout – Essential Strength Library Screen

**File:** `View/StartWorkoutEssentialStrengthLibrary.xaml` + `.xaml.cs`  
**ViewModel:** `WorkoutViewModel`  
**Type:** ContentPage (pushed via Navigation.PushAsync)

**Purpose:** Lists all available workouts for a given package (ES, ES+) or for a selected FF/FF+ difficulty level.

**Constructor Parameters:**
- `int workoutType` — numeric ID (5=ES, 6=ES+, or a WorkoutName ID for FF)
- `string workoutTypeName` — package code string ("ES", "ES+", "FF", "FF+")
- `string displayName` — display label (e.g., difficulty name)

**Preferences Set on Load:**
- `WorkoutTypeId` = workoutType (numeric ID)
- `WorkoutType` = workoutTypeName (string code)
- `WorkoutName` = workoutTypeName
- `DisplayName` = displayName

**Data Fetched (in WorkoutViewModel):**
- `GET /collections/t_2dl41m0w1qmseomeg8c08p52i`
- Filter: `WorkoutType.Contains(workoutType)` — workouts whose type array includes the passed ID
- Sort: by `SortOrder` (stored as string, parsed to int; unparseable values go to bottom)
- Internet check before fetch; shows alert and aborts if offline

**Page Titles:**

| workoutTypeName | PageTitle |
|---|---|
| `FF` | Functional Fitness |
| `FF+` | Functional Fitness Plus |
| `ES` | Essential Strength |
| `ES+` | Essential Strength Plus |

**Workout Card Tap (`OnCategorySelected`):**
- Navigates to `StartWorkoutEssentialStrengthLibraryDetail(workoutItem.Id)`

**Back Button:** `//Dashboard`  
**Navigation:** → StartWorkoutEssentialStrengthLibraryDetail

---

### 7.15 Start Workout – Detail Screen

**File:** `View/StartWorkoutEssentialStrengthLibraryDetail.xaml` + `.xaml.cs`  
**Type:** ContentPage (pushed via Navigation.PushAsync)

**Purpose:** Shows the name and description of a selected workout before the user starts it.

**Constructor Parameters:**
- `int id` — the Workout record ID

**Data Fetched:**
- `GET /collections/t_2dl41m0w1qmseomeg8c08p52i/{id}`
- Fields used: `Name` (emoji stripped with `Replace("⬇️", "").Trim()`), `Description`, `Id`, `WorkoutType`

**UI Elements:**
- Workout name label
- Description text
- "Start" button → navigates to video player

**Internet Check:** Yes (before API call)  
**Navigation:** → StartWorkoutEssentialStrengthLibraryDetailVideo | Back (Pop)

---

### 7.16 Start Workout – Video Player Screen

**File:** `View/StartWorkoutEssentialStrengthLibraryDetailVideo.xaml.cs`  
**Type:** ContentPage (pushed via Navigation.PushAsync)

**Purpose:** Plays the workout videos in sequence. First plays all "regular" videos, then switches to "circuit" videos that loop indefinitely.

**Constructor Parameters:**
- `int workoutType` — the Workout record ID

**Preferences Read on Load:**
- `WorkoutType` (int) — numeric workout type
- `WorkoutName` — package code string
- `DisplayName` — display label

**Data Fetch Sequence:**

**Step 1:** Workout record
```
GET /collections/t_2dl41m0w1qmseomeg8c08p52i/{workoutId}
→ Gets Videos[] (regular) and CircuitVideos[] (circuit) arrays
```

**Step 2:** All video data
```
GET /collections/t_8a5292fda6ce4580b6c78da83ec8bac2
→ Match by IDs from Videos[] and CircuitVideos[]
→ Preserve order from ID arrays (using .IndexOf)
→ Extract VideoFile.Url strings into RegularVideoUrl and CircuitVideoUrls lists
```

**Playback Logic:**
- Starts with `RegularVideoUrl[0]`, plays in order
- After last regular video, switches to `CircuitVideoUrls[0]`
- Circuit videos loop (`% CircuitVideoUrls.Count`)
- If no circuit videos: regular videos loop
- "Next" button: advances to next regular video, or first circuit video after regular exhausted
- "Back" button: goes to previous video, wrapping back through circuit if at start
- Timer: counts up from 00:00, resets on every video change

**Fullscreen Mode:**
- Hides system navigation bar and status bar on enter
- Restores on exit/disappearing

**Screen Keep-On:**
- `OnMediaOpened` → `DeviceDisplay.KeepScreenOn = true`
- `OnMediaEnded` / `OnDisappearing` → `KeepScreenOn = false`

**Internet Handling:**
- `EnsureInternetAsync()`: 1.5s stabilization wait; shows alert once; does not pop page

**"Home" Button:**
- Navigates back to `StartWorkoutEssentialStrengthLibrary` with saved package preferences

**Navigation:** Back (Pop) / Home → StartWorkoutEssentialStrengthLibrary

---

### 7.17 Start Workout – Functional Fitness Library Screen

**File:** `View/StartWorkoutFunctionFitnessLibrary.xaml` + `.xaml.cs`  
**ViewModel:** `DashboardViewModel`  
**Type:** ContentPage (pushed via Navigation.PushAsync)

**Purpose:** For FF and FF+ packages — shows a list of workout difficulty/category cards (e.g., Beginner, Intermediate, Advanced, Senior). Each card represents a `WorkoutName` record.

**Constructor Parameters:**
- `string workoutType` — "FF" or "FF+"

**Data Fetched (in DashboardViewModel):**
- `GET /collections/t_dlmt45r94hqmqdjcc1r085vhw`
- Filter: `WorkoutType == workoutType` ("FF" or "FF+")
- Sort: by `Order` (ascending, from API pre-sorted)

**Page Titles:**

| workoutType | PageTitle |
|---|---|
| `FF+` | Functional Fitness Plus |
| `FF` | Functional Fitness |

**Card Tap (`OnCategorySelected`):**
- Gets `WorkoutName` item from binding context
- Navigates to `StartWorkoutEssentialStrengthLibrary(selectedId, selectedWorkoutType, selectedDisplayName)`

**Navigation:** → StartWorkoutEssentialStrengthLibrary | Back → `//Dashboard`

---

### 7.18 DoorGym Setup Screen

**File:** `View/SetupVideo.xaml` + `View/SetupVideo.xaml.cs`  
**Type:** ContentPage (Shell route: `//SetupVideo`)

**Purpose:** Displays a list of DoorGym hardware setup video cards. Each card has a thumbnail and can be played full-screen.

**Data Fetched:**
- `GET /collections/t_9kgvjproxyr7yxj9urzxnp173`
- All records, sorted by `Id` ascending
- Loaded on every `OnAppearing`

**Video Playback:**
- Uses `PlayVideoCommand` (Command<string>) with YouTube embed URL
- `PlaySelectedVideo(videoUrl)`:
  - Shows `FullScreenVideoOverlay`
  - Sets `FullScreenMediaElement.Source = videoUrl`
  - Hides status bar, NavBar
  - Sets background to black

**Internet Handling:**
- `Connectivity_ConnectivityChanged` event handler with 1.5s delay; shows alert once per disconnection
- Does not block loading if video list already loaded

**App Background:**
- `WeakReferenceMessenger` receives `"PauseVideo"` → pauses `FullScreenMediaElement`

**Navigation:** Back → `//Dashboard`

---

### 7.19 Exercise Library Router Page

**File:** `View/ExerciseLibraryRouterPage.xaml.cs`  
**Note:** This route exists in `AppShell.xaml` but is commented out from the flyout menu. It is accessible if routed to directly but not currently surfaced in the UI.

---

## 8. Data Filtering, Sorting & Search Logic

### Summary Table

| Screen | API Collection | Filter | Sort |
|---|---|---|---|
| EducationLibrary | t_7jno5rsxknzmpb4kd1tylxbbu | None (all records) | `Order` ascending |
| EducationLibraryDetailVideo | t_dwbz6fc4ez38zy11pxe8wzmli | `EducationLibraryVM.Contains(id) AND LibraryType == type` | `Order` ascending; `FirstOrDefault` |
| EducationLibraryDetailVideo | t_8a5292fda6ce4580b6c78da83ec8bac2 | `EducationCategories.Contains(categoryId)` + intersect with `category.Videos` | Preserves `category.Videos` index order |
| ExerciseLibraryEssentialStrength | t_0n6u0ucupytzk80vpuuy7olp1 | `LibraryType == type AND ShowInTheLibrary == true` | `Order` ascending |
| ExerciseLibraryEssentialStrengthVideo | t_8a5292fda6ce4580b6c78da83ec8bac2 | `Categories.Contains(exerciseCategoryId)` | Group by `DifficultyLevel.Min()` desc, then Title A-Z |
| StartWorkoutEssentialStrengthLibrary | t_2dl41m0w1qmseomeg8c08p52i | `WorkoutType.Contains(numericId)` | `SortOrder` (string→int) ascending |
| StartWorkoutFunctionFitnessLibrary | t_dlmt45r94hqmqdjcc1r085vhw | `WorkoutType == "FF"` or `"FF+"` | `Order` ascending |
| SetupVideo | t_9kgvjproxyr7yxj9urzxnp173 | None | `Id` ascending |

### Search
No user-facing search functionality is implemented. All filtering is programmatic based on package type and ID relationships.

### G1 Grouping Logic (Exercise Library)

Exercises in the library have a `Grouping` field. When `Grouping == "G1"`, the item is treated as a "featured" or "special" exercise category. The `ExerciseLibraryViewModel` separates these:
- `Exercises` (main grid): all non-G1 items
- `FilteredExercises` (secondary section): G1 items only
- `IsExerciseVisible`: true only if FilteredExercises is non-empty

---

## 9. Business Logic & Calculations

### Package Type Codes

| Code | Numeric ID (used in Workout filter) | Meaning |
|---|---|---|
| `ES` | 5 | Essential Strength |
| `ES+` | 6 | Essential Strength Plus |
| `FF` | — | Functional Fitness |
| `FF+` | — | Functional Fitness Plus |

### Workout Video Playback Sequence (ES/ES+)

```
Regular videos: played sequentially (index 0 → N-1)
                when index reaches N → switch to Circuit
Circuit videos: loop indefinitely (index % CircuitCount)

If no circuit videos: regular videos loop (index % RegularCount)

"Next" from last regular → first circuit
"Next" from last circuit → loops back to first circuit
"Back" from first regular → wraps to last circuit (or last regular if no circuit)
```

### Education Item — Full-Screen Detection

```csharp
bool openFullScreenOnly = item.Order == 1;
```
Items with `Order == 1` in the Education Library open directly in full-screen video mode, bypassing the detail page layout.

### Title Rearrangement (`ExerciseLibraryDetails.RearrangedTitle`)

Exercise titles stored as `"Exercise Name - Difficulty"` are rearranged to `"Difficulty - Exercise Name"` for display using:
```csharp
var parts = Title.Split(" - ");
return $"{parts[^1]} - {string.Join(" - ", parts.Take(parts.Length - 1))}";
```

### Item Height Calculation (`ExerciseLibraryVM.ItemHeight`)

Dynamic row height for exercise category cards based on name length:
- `> 60 chars` → 260px (3-line text)
- `> 30 chars` → 230px (2-line text)
- `≤ 30 chars` → 200px (1-line text)

### YouTube URL Embed Parameters

Education items and setup videos append these parameters to their YouTube embed links:
```
?controls=1&modestbranding=1&rel=0&showinfo=0
```

### Timer

A `System.Timers.Timer` counting up from 00:00 is started when a video begins playing in:
- `StartWorkoutEssentialStrengthLibraryDetailVideo`
- `ExerciseLibraryEssentialStrengthVideo`
- `EducationLibraryDetailVideo`

Timer resets to 00:00 when the user navigates to a different video. Timer stops on page `OnDisappearing`.

### Difficulty Level Display Mapping

Difficulty level IDs stored in video records are resolved to human-readable names via the `DifficultyLevel` collection:
```csharp
exercise.DifficultyLevel  // List<int> of IDs
→ mapped against loaded DifficultyLevel list
→ joined as comma-separated string for display
```

---

## 10. External Integrations & Services

### Adalo REST API

- **Role:** Backend database and content management system
- **Base URL:** `https://api.adalo.com/v0/apps/3d819e28-0522-4a47-99f0-1d3b2d5b8b54/`
- **Auth:** Bearer token (static, hardcoded)
- **Method:** GET only (read-only app)

### Cloudflare Stream

- **Role:** Hosts the intro video as an HLS stream
- **Protocol:** HLS (.m3u8)
- **Usage:** `IntroVideo` screen only

### YouTube Embed

- **Role:** Hosts educational and setup guide videos
- **Integration:** YouTube embed URLs stored in Adalo, loaded into `WebView` or `MediaElement`
- **Usage:** SetupVideo screen, EducationLibraryDetail (thumbnail tap)

### System Browser (Launcher)

- **Role:** Opens the DoorGym e-commerce website
- **URL:** `https://thedoorgym.com/`
- **Usage:** "Shop Website" flyout item, "Shop Now" Dashboard button
- **API:** `Launcher.Default.OpenAsync(uri)` or `Browser.Default.OpenAsync(uri, BrowserLaunchMode.SystemPreferred)`

### CommunityToolkit.Maui.MediaElement

- **Role:** Cross-platform video playback
- **Usage:** All in-app video screens (workout videos, exercise videos, education videos, setup videos)
- **Features used:** `Source`, `Play()`, `Pause()`, `Stop()`, `MediaOpened`, `MediaEnded`, `MediaFailed`

### CommunityToolkit.Mvvm (WeakReferenceMessenger)

- **Role:** Cross-page messaging for app lifecycle events
- **Message:** `"PauseVideo"` — sent when app goes to background (Android `OnPause`, iOS `DidEnterBackground`)
- **Subscribers:** `SetupVideo`, `EducationLibraryDetail` — pause active video playback

---

## 11. Global State Management

### Preferences (Persistent Storage)

| Key | Type | Set By | Read By | Purpose |
|---|---|---|---|---|
| `HasSeenIntro` | `bool` | Disclaimer (on agree) | Splash | Controls first-run flow |
| `WorkoutType` | `string` | Package, StartWorkout | Dashboard, all screens | Currently selected package code |
| `WorkoutTypeId` | `int` | StartWorkoutEssentialStrengthLibrary | StartWorkoutDetailVideo | Numeric package ID |
| `WorkoutName` | `string` | StartWorkoutEssentialStrengthLibrary | StartWorkoutDetailVideo | Package code string |
| `DisplayName` | `string` | StartWorkoutEssentialStrengthLibrary | StartWorkoutDetailVideo | Display label for current workout |

### Static/In-Memory

| Location | Purpose |
|---|---|
| `SharedData.DifficultyLevels` (static) | Cached difficulty level list populated by `ExerciseLibraryDetailViewModel`; available globally |
| `_exerciseCache` (per-page Dictionary) | Per-instance cache of `ExerciseLibraryDetails` by ID in video screens — avoids re-fetching same video metadata |

### Shell Navigation State

The `AppShell` uses a flyout. `OnShellNavigated` hides flyout items that match the current route (prevents redundant navigation) and auto-closes the flyout on navigate.

---

## 12. Converters

Located in `Converters/`:

| Converter | Purpose |
|---|---|
| `BoolToObjectConverter` | Maps a boolean to two different values (e.g., color, object) |
| `SelectedAndIndexToColorConverter` | Returns a color based on whether an item is selected and its index |
| `SelectedIndexToBackgroundConverter` | Returns a background resource based on selected index |
| `SelectedToFontSizeConverter` | Returns font size based on selection state |
| `WordLimitConverter` | Truncates a string to a word limit for display |

---

## 13. Assumptions, Dependencies & Known Limitations

### Security

- **Bearer token is hardcoded** in `Models/Constants.cs`. The token `ehhqnffmrvew4diazu17rifzy` is embedded in the compiled binary. Any user with access to the APK can extract this token and make API calls directly. For production hardening, this token should be fetched from a secure endpoint or obfuscated.

### API Design

- **No server-side filtering.** All API calls fetch entire collections. Filtering is performed client-side in LINQ. For large datasets this will become a performance bottleneck. Adalo does support filtering via query parameters, but they are not used.
- **No pagination.** All records are fetched in a single request per collection.
- **Shared video collection** (`t_8a5292fda6ce4580b6c78da83ec8bac2`) is used for both `ExerciseLibraryDetails` and `Video` models. Both models map the same JSON structure; the difference is which fields each view uses.

### Commented-Out / Excluded Code

- `View/ExerciseLibrary.xaml` and `View/StartWorkout.xaml` are **excluded from compilation** in the `.csproj` (`<Compile Remove="..." />`). They exist as legacy files.
- The **Exercise Library flyout menu item** is commented out in `AppShell.xaml`. Exercise Library is only accessible from the Dashboard button.
- `ExerciseLibraryRouterPage` exists as a Shell route but is not visible in the flyout.
- `WorkoutMasterName` (`t_9vyas8u7y2f08gxk08awkh8ax`) is fetched by `GetWorkoutMasterNameList()` in `RestService` but is not used by any currently active screen.

### Platform Support

- **Primary target is Android** (`net10.0-android36.0`). iOS, macOS Catalyst, Tizen, and Windows platform code exists in the project but `TargetFrameworks` in `.csproj` is set to Android only.
- Min Android API: 28 (Android 9.0 Pie)

### Video Playback

- **Videos require an active internet connection.** The app does not cache video files locally.
- **Cache-busting** is applied to video URLs when loading in video screens: a `?cb={timestamp}` query parameter is appended. This is required because some CDN/signed URLs can be identical across requests and the native player may not reload without a URL change.
- **Screen timeout** is disabled (`DeviceDisplay.KeepScreenOn = true`) during video playback and re-enabled when a video ends or the page is navigated away from.

### Navigation

- The back button is hidden on several screens (`BackButtonBehavior.IsEnabled = false`) to prevent users from navigating back into a stale stack. Custom back buttons navigate to specific Shell routes instead.
- The `StartWorkoutRouterPage` uses a `_handled` flag to prevent double-navigation if `OnAppearing` fires more than once.
- Some pages use `Shell.Current.GoToAsync("//Route")` (absolute) while others use `Navigation.PushAsync()` (modal stack). The mix means some back-stack behavior can be non-intuitive.

### Known Issues

- `ExerciseLibraryRouterPage` is a registered Shell route but navigating to it may display a blank page if reached without a valid `WorkoutType`.
- On first launch, if the user exits during the intro video before the Disclaimer is shown, `HasSeenIntro` remains `false` and the intro will play again on next launch — this is by design.
- Emoji stripping in workout names (`Replace("⬇️", "").Trim()`) only handles this specific emoji; other emojis in names would appear unmodified.

### Android Keystore

- The app is signed with a keystore file (`gymapp.keystore`, password `gym@123`, alias `gymapp`). This keystore file is included in the repository — the password is present in both the `.csproj` file and should be secured before any public source code exposure.

---

*End of Technical Documentation*
