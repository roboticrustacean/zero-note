# Zero Note: Minimalist Single-Note Android Application Design

## 1. Overview & Vision
Zero Note is an ultra-minimalist, distraction-free single-note Android application inspired by the iOS Mononote philosophy. The core premise is radical focus: **only one active note exists at any time**. 

There are no folder trees, complex tag taxonomies, or multi-screen navigations on app launch. When opened, the user is immediately inside the editor. The app integrates deeply with Android system surfaces (Lock Screen persistent notification, Home Screen widgets, and Quick Settings) to keep the single active priority in sight, with full architectural parity for future iOS porting.

---

## 2. Core User Flows & UI Specifications

### 2.1 Main Editor Screen (Zero Friction)
- **Instant Launch:** App opens directly into the active note. 
- **Interactive Checklists:** Lines prefixed with `- [ ]` or `[ ]` render as interactive custom minimalist checkboxes. Tapping smoothly toggles `- [x]` with subtle strike-through formatting, muted color transition, and haptic feedback.
- **Auto-Formatting & Hyperlinks:** Clean support for bold, italics, markdown headers, and automatic tappable hyperlinks.
- **Top Minimalist Control Bar:**
  - `[Settings]` (Left): Opens modal/sheet for theme, typography, font size, widget instructions, and data management.
  - `[Lock Screen Pin]` (Center-Right): One-tap toggle to pin/unpin the active note as a persistent high-priority notification on the Android Lock Screen.
  - `[Archive]` (Right): Archives the active note with a smooth transition, saves it to history with a timestamp, and generates a fresh blank canvas.
- **Bottom Status Row:**
  - Discreet, low-contrast counter for word count, character count, and real-time auto-save indicator.

### 2.2 Archive & History Sheet
- Accessible via the Archive icon or upward swipe gesture.
- Displays past notes in reverse chronological order grouped by relative dates (*Today*, *Yesterday*, *Last Week*, *Older*).
- **Live Search:** Instant client-side search across all archived notes.
- **Card Actions:**
  - **Restore:** Loads the archived note into the active editor (prompts if the current note has unsaved changes).
  - **Copy / Share:** Quick copy to system clipboard or trigger Android system share sheet.
  - **Delete:** Permanently removes note with an undo snackbar.

### 2.3 Settings & Customization
- **Theme Selection:**
  - *Pure OLED Black:* Canvas `#000000`, Card `#0A0A0A`, Border `#1F1F1F`, Text `#EAEAEA`.
  - *Warm Paper / Bone:* Canvas `#F7F6F3`, Card `#FFFFFF`, Border `#EAEAEA`, Text `#1F1F1F`.
  - *Clean Minimal Light:* Canvas `#FFFFFF`, Card `#FAFAFA`, Border `#EAEAEA`, Text `#111111`.
- **Typography Engine:**
  - *Monospace:* `Fragment Mono` / `Geist Mono` / `SF Mono` (Default identity).
  - *Editorial Serif:* `Newsreader` / `Instrument Serif`.
  - *Modern Sans:* `Geist Sans` / `Switzer`.
- **Type Scale Controls:** Compact (15px), Standard (17px), Large (20px).
- **Data Export & Backup:** Export all notes as a unified Markdown/JSON file, or import existing backups.

---

## 3. Android System Integrations (Lock Screen & Widgets)

### 3.1 Lock Screen & Notification Shade Sync
- **Service:** High-priority ongoing notification (`NotificationCompat.Builder` with `VISIBILITY_PUBLIC` and `PRIORITY_HIGH`).
- **Always Updated:** Any edit to the active note automatically updates the notification title and expanded body text in real-time.
- **Action Buttons on Notification:**
  - *Archive:* Directly archives the current note from the lock screen/shade and clears the note.
  - *Open:* Deep-links directly to the editor.
- **Persistence:** Configured as an ongoing notification so it stays pinned on the lock screen until the user unpins or archives.

### 3.2 Android Home Screen Widget
- Minimalist text widget displaying the live content of the active note.
- Matches the app's selected theme (OLED Dark, Warm Paper, or Clean Light).
- Tap-to-open interaction for instant editing.

---

## 4. Technical Architecture & Tech Stack

### 4.1 Technology Stack
- **Framework:** React Native + TypeScript with Expo SDK.
- **Storage:** Local-first key-value / SQLite persistence with sub-millisecond read/write latency.
- **Styling:** Custom CSS/StyleSheet adhering to the *Minimalist UI / Taste Protocol* (zero heavy shadows, crisp 1px borders, tailored monochrome colors, generous whitespace).
- **Haptics:** `expo-haptics` for subtle tactile responses on checkbox toggles and archive actions.
- **Notifications & Widgets:** `expo-notifications` and custom Android notification channel handler for lock screen persistence.

### 4.2 Data Models

```typescript
export interface Note {
  id: string;
  content: string;
  createdAt: number; // Unix timestamp
  updatedAt: number;
  archivedAt?: number;
  isPinned: boolean;
}

export interface UserPreferences {
  theme: 'oled-dark' | 'warm-paper' | 'clean-light';
  fontFamily: 'mono' | 'sans' | 'serif';
  fontSize: 'compact' | 'standard' | 'large';
  lockScreenPinned: boolean;
  hapticsEnabled: boolean;
  showWordCount: boolean;
}
```

---

## 5. Non-Functional Requirements & Taste Guardrails
1. **Zero Slop & Distraction-Free:** No generic colorful gradients, no purple-on-dark clichés, no heavy drop shadows.
2. **Instant Performance:** App launches in `< 200ms`, note edits auto-saved with zero input latency.
3. **100% Privacy & Offline-First:** No accounts, no sign-ups, zero network telemetry, 100% local storage.
4. **Cross-Platform Readiness:** Clear code separation allowing future iOS compilation (with `ActivityKit` / `WidgetKit` targets).
