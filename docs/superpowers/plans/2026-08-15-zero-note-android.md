# Zero Note (Android Minimalist Note Clone) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Zero Note", an ultra-minimalist, distraction-free single-note Android application inspired by iOS Mononote with persistent lock screen notifications, home screen widget support, and cross-platform architecture.

**Architecture:** React Native + TypeScript with Expo SDK. Features a local-first, zero-latency key-value persistence engine, custom minimalist design system (OLED dark, warm paper, clean light), markdown checklist parser with haptics, archive drawer with full-text search, and Android notification service with `VISIBILITY_PUBLIC` for Lock Screen display.

**Tech Stack:** React Native, Expo, TypeScript, `@react-native-async-storage/async-storage`, `expo-haptics`, `expo-notifications`, `expo-status-bar`, Jest, React Native Testing Library.

## Global Constraints

- App Name: Zero Note (`com.zeronote.app`)
- Single Note Rule: Only ONE active note exists at any time in the main editor.
- Taste Constraints: No AI-slop gradients, no generic thin drop shadows, crisp 1px `#1F1F1F`/`#EAEAEA` borders, tight typography tracking, generous whitespace.
- 100% Offline & Private: No cloud requirements, instant local storage.
- Platform: Android primary with clean separation for future iOS build targets.

---

### Task 1: Project Scaffolding, Dependencies & Theme System Foundation

**Files:**
- Create: `package.json`
- Create: `app.json`
- Create: `tsconfig.json`
- Create: `babel.config.js`
- Create: `jest.config.js`
- Create: `src/theme/types.ts`
- Create: `src/theme/colors.ts`
- Create: `src/theme/typography.ts`
- Create: `src/theme/ThemeContext.tsx`
- Test: `tests/theme/theme.test.ts`

**Interfaces:**
- Produces:
  - `Theme` interface, `ColorPalette` tokens (`oled-dark`, `warm-paper`, `clean-light`)
  - `Typography` tokens (`mono`, `sans`, `serif`)
  - `ThemeProvider` and `useTheme()` hook

- [ ] **Step 1: Write the failing test for theme tokens and provider**

```typescript
// tests/theme/theme.test.ts
import { themes, getTheme } from '../../src/theme/colors';

describe('Theme System', () => {
  it('should provide OLED dark theme with pure black canvas and contrast text', () => {
    const dark = getTheme('oled-dark');
    expect(dark.canvas).toBe('#000000');
    expect(dark.card).toBe('#0A0A0A');
    expect(dark.text).toBe('#EAEAEA');
    expect(dark.border).toBe('#1F1F1F');
  });

  it('should provide Warm Paper theme with warm bone canvas', () => {
    const paper = getTheme('warm-paper');
    expect(paper.canvas).toBe('#F7F6F3');
    expect(paper.card).toBe('#FFFFFF');
    expect(paper.text).toBe('#1F1F1F');
    expect(paper.border).toBe('#EAEAEA');
  });

  it('should provide Clean Light theme', () => {
    const light = getTheme('clean-light');
    expect(light.canvas).toBe('#FFFFFF');
    expect(light.text).toBe('#111111');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/theme/theme.test.ts`
Expected: FAIL (modules not found)

- [ ] **Step 3: Setup configuration files, dependencies, and theme system**

Create `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`, `jest.config.js`, `src/theme/types.ts`, `src/theme/colors.ts`, `src/theme/typography.ts`, and `src/theme/ThemeContext.tsx`. Install npm dependencies.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/theme/theme.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json app.json babel.config.js jest.config.js src/theme/ tests/theme/
git commit -m "feat: scaffold project and implement minimalist theme system"
```

---

### Task 2: Data Models & Local-First Storage Engine

**Files:**
- Create: `src/types/note.ts`
- Create: `src/types/settings.ts`
- Create: `src/services/storage.ts`
- Create: `src/context/NotesContext.tsx`
- Test: `tests/services/storage.test.ts`
- Test: `tests/context/NotesContext.test.tsx`

**Interfaces:**
- Consumes: `ThemeType`, `FontFamilyType` from `src/theme/types.ts`
- Produces:
  - `Note`, `UserPreferences` interfaces
  - `storageService`: `getActiveNote()`, `saveActiveNote()`, `archiveActiveNote()`, `getArchivedNotes()`, `restoreArchivedNote()`, `deleteArchivedNote()`, `getSettings()`, `saveSettings()`, `exportData()`, `importData()`
  - `NotesProvider` and `useNotes()` hook

- [ ] **Step 1: Write failing tests for storage service**

```typescript
// tests/services/storage.test.ts
import { storageService } from '../../src/services/storage';

describe('StorageService', () => {
  beforeEach(async () => {
    await storageService.clearAll();
  });

  it('saves and retrieves active note', async () => {
    const note = await storageService.saveActiveNote('Buy groceries\n- [ ] Milk');
    expect(note.content).toBe('Buy groceries\n- [ ] Milk');
    
    const retrieved = await storageService.getActiveNote();
    expect(retrieved.content).toBe('Buy groceries\n- [ ] Milk');
  });

  it('archives active note and resets active note to blank', async () => {
    await storageService.saveActiveNote('Important plan');
    const archived = await storageService.archiveActiveNote();
    
    expect(archived.content).toBe('Important plan');
    expect(archived.archivedAt).toBeDefined();

    const active = await storageService.getActiveNote();
    expect(active.content).toBe('');

    const history = await storageService.getArchivedNotes();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(archived.id);
  });

  it('restores archived note', async () => {
    await storageService.saveActiveNote('Old thought');
    const archived = await storageService.archiveActiveNote();
    
    await storageService.restoreArchivedNote(archived.id);
    const active = await storageService.getActiveNote();
    expect(active.content).toBe('Old thought');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/services/storage.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement storage service and types**

Implement `src/types/note.ts`, `src/types/settings.ts`, `src/services/storage.ts`, and `src/context/NotesContext.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/services/storage.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/ src/services/ src/context/ tests/services/
git commit -m "feat: implement local-first storage engine and notes context"
```

---

### Task 3: Minimalist Markdown & Interactive Checklist Parser

**Files:**
- Create: `src/utils/markdownParser.ts`
- Create: `src/components/ChecklistItem.tsx`
- Test: `tests/utils/markdownParser.test.ts`

**Interfaces:**
- Consumes: Note string content
- Produces:
  - `parseMarkdownLines(text: string): ParsedLine[]`
  - `toggleChecklistLine(text: string, lineIndex: number): string`
  - `calculateNoteStats(text: string): { words: number; chars: number; readingTimeSec: number }`
  - `ChecklistItem` React component

- [ ] **Step 1: Write failing tests for markdown & checklist parsing**

```typescript
// tests/utils/markdownParser.test.ts
import { parseMarkdownLines, toggleChecklistLine, calculateNoteStats } from '../../src/utils/markdownParser';

describe('Markdown Parser & Checklist Utils', () => {
  it('identifies checklist items, headings, and plain text', () => {
    const text = '# Today\n- [ ] Task 1\n- [x] Task 2\nNormal note';
    const lines = parseMarkdownLines(text);

    expect(lines[0].type).toBe('heading');
    expect(lines[1].type).toBe('checklist');
    expect(lines[1].checked).toBe(false);
    expect(lines[1].text).toBe('Task 1');
    expect(lines[2].type).toBe('checklist');
    expect(lines[2].checked).toBe(true);
    expect(lines[3].type).toBe('paragraph');
  });

  it('toggles checklist line from unchecked to checked and vice versa', () => {
    const text = '- [ ] Buy coffee\n- [x] Write code';
    const updated = toggleChecklistLine(text, 0);
    expect(updated).toBe('- [x] Buy coffee\n- [x] Write code');

    const toggledBack = toggleChecklistLine(updated, 1);
    expect(toggledBack).toBe('- [x] Buy coffee\n- [ ] Write code');
  });

  it('calculates note word count and character count accurately', () => {
    const text = 'Hello world! Focus on one note.';
    const stats = calculateNoteStats(text);
    expect(stats.words).toBe(6);
    expect(stats.chars).toBe(31);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/utils/markdownParser.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement parser and checklist utilities**

Implement `src/utils/markdownParser.ts` and `src/components/ChecklistItem.tsx` with clean regex and string manipulation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/utils/markdownParser.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/markdownParser.ts src/components/ChecklistItem.tsx tests/utils/
git commit -m "feat: implement markdown checklist parser and note statistics"
```

---

### Task 4: Main Editor Screen, Header & Footer UI

**Files:**
- Create: `src/components/HeaderBar.tsx`
- Create: `src/components/FooterBar.tsx`
- Create: `src/components/Editor.tsx`
- Create: `src/screens/EditorScreen.tsx`
- Test: `tests/screens/EditorScreen.test.tsx`

**Interfaces:**
- Consumes: `useTheme()`, `useNotes()`, `parseMarkdownLines()`, `toggleChecklistLine()`
- Produces:
  - `HeaderBar` with Settings, Pin toggle, Archive, Share actions
  - `FooterBar` with subtle word/char count and auto-saved indicator
  - `EditorScreen` full screen component

- [ ] **Step 1: Write test for EditorScreen rendering and actions**

```typescript
// tests/screens/EditorScreen.test.tsx
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { EditorScreen } from '../../src/screens/EditorScreen';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { NotesProvider } from '../../src/context/NotesContext';

describe('EditorScreen', () => {
  it('renders editor and allows typing', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <ThemeProvider>
        <NotesProvider>
          <EditorScreen onOpenSettings={jest.fn()} onOpenArchive={jest.fn()} />
        </NotesProvider>
      </ThemeProvider>
    );

    const input = getByPlaceholderText('Write your note...');
    fireEvent.changeText(input, 'My single active note');
    expect(input.props.value).toBe('My single active note');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/screens/EditorScreen.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement HeaderBar, FooterBar, Editor and EditorScreen**

Implement the components strictly following the Minimalist UI specifications:
- Full screen auto-expanding TextInput with custom line height.
- Toggle between raw typing and interactive checklist tap.
- Smooth haptics via `expo-haptics`.
- HeaderBar with crisp SVG icon buttons.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/screens/EditorScreen.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/HeaderBar.tsx src/components/FooterBar.tsx src/components/Editor.tsx src/screens/EditorScreen.tsx tests/screens/EditorScreen.test.tsx
git commit -m "feat: implement Zero Note editor screen, header and footer controls"
```

---

### Task 5: Archive & History Drawer / Screen

**Files:**
- Create: `src/components/ArchiveCard.tsx`
- Create: `src/screens/ArchiveScreen.tsx`
- Test: `tests/screens/ArchiveScreen.test.tsx`

**Interfaces:**
- Consumes: `useNotes()`, `useTheme()`, `Note`
- Produces: `ArchiveScreen` component with search filter, date grouping, restore, copy, and delete actions

- [ ] **Step 1: Write test for ArchiveScreen**

```typescript
// tests/screens/ArchiveScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ArchiveScreen } from '../../src/screens/ArchiveScreen';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { NotesProvider } from '../../src/context/NotesContext';

describe('ArchiveScreen', () => {
  it('renders search input and archived note items', () => {
    const { getByPlaceholderText } = render(
      <ThemeProvider>
        <NotesProvider>
          <ArchiveScreen onClose={jest.fn()} />
        </NotesProvider>
      </ThemeProvider>
    );

    expect(getByPlaceholderText('Search archived notes...')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/screens/ArchiveScreen.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement ArchiveCard and ArchiveScreen**

Build `src/components/ArchiveCard.tsx` and `src/screens/ArchiveScreen.tsx` with date categorization (*Today*, *Yesterday*, *Last 7 Days*, *Earlier*), search highlighting, restore confirmation, clipboard copy, and delete with undo.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/screens/ArchiveScreen.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ArchiveCard.tsx src/screens/ArchiveScreen.tsx tests/screens/ArchiveScreen.test.tsx
git commit -m "feat: implement archive history screen with search and restore"
```

---

### Task 6: Settings, Customization & Data Backup Screen

**Files:**
- Create: `src/screens/SettingsScreen.tsx`
- Create: `src/components/ThemeSelector.tsx`
- Create: `src/components/FontSelector.tsx`
- Test: `tests/screens/SettingsScreen.test.tsx`

**Interfaces:**
- Consumes: `useTheme()`, `useNotes()`
- Produces: `SettingsScreen` modal with theme switcher, font switcher, font size scale, lock screen toggle, and JSON/Markdown export & import

- [ ] **Step 1: Write test for SettingsScreen**

```typescript
// tests/screens/SettingsScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsScreen } from '../../src/screens/SettingsScreen';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { NotesProvider } from '../../src/context/NotesContext';

describe('SettingsScreen', () => {
  it('renders theme and font choices', () => {
    const { getByText } = render(
      <ThemeProvider>
        <NotesProvider>
          <SettingsScreen onClose={jest.fn()} />
        </NotesProvider>
      </ThemeProvider>
    );

    expect(getByText('OLED Dark')).toBeTruthy();
    expect(getByText('Warm Paper')).toBeTruthy();
    expect(getByText('Clean Light')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/screens/SettingsScreen.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement SettingsScreen and selectors**

Implement `src/components/ThemeSelector.tsx`, `src/components/FontSelector.tsx`, and `src/screens/SettingsScreen.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/screens/SettingsScreen.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ThemeSelector.tsx src/components/FontSelector.tsx src/screens/SettingsScreen.tsx tests/screens/SettingsScreen.test.tsx
git commit -m "feat: implement settings screen for themes, typography, and data export"
```

---

### Task 7: Android Lock Screen Persistent Notification Service

**Files:**
- Create: `src/services/notificationService.ts`
- Test: `tests/services/notificationService.test.ts`

**Interfaces:**
- Consumes: Note content, user preferences
- Produces:
  - `initNotificationChannel()`
  - `updateLockScreenNotification(noteContent: string, isPinned: boolean)`
  - `dismissLockScreenNotification()`

- [ ] **Step 1: Write test for notificationService formatting and channel setup**

```typescript
// tests/services/notificationService.test.ts
import { notificationService } from '../../src/services/notificationService';

describe('NotificationService', () => {
  it('formats notification title and body cleanly', () => {
    const content = '# Daily Goal\n- [ ] Ship Android app\n- [ ] Test on device';
    const payload = notificationService.formatNotificationPayload(content);
    
    expect(payload.title).toBe('Daily Goal');
    expect(payload.body).toContain('• Ship Android app');
  });

  it('handles single line note', () => {
    const payload = notificationService.formatNotificationPayload('Remember to call mom');
    expect(payload.title).toBe('Zero Note');
    expect(payload.body).toBe('Remember to call mom');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/services/notificationService.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement notification service**

Implement `src/services/notificationService.ts` using `expo-notifications` with Android channel `zeronote_lockscreen`, `importance: AndroidImportance.HIGH`, and `visibility: AndroidNotificationVisibility.PUBLIC`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/services/notificationService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/notificationService.ts tests/services/notificationService.test.ts
git commit -m "feat: implement Android persistent lock screen notification service"
```

---

### Task 8: Root Application Wiring & Verification

**Files:**
- Create: `App.tsx`
- Create: `index.js`
- Test: `tests/App.test.tsx`

**Interfaces:**
- Consumes: `ThemeProvider`, `NotesProvider`, `EditorScreen`, `ArchiveScreen`, `SettingsScreen`, `notificationService`
- Produces: Full working application entry point

- [ ] **Step 1: Write test for root App component integration**

```typescript
// tests/App.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('Zero Note Root App', () => {
  it('renders root application successfully', () => {
    const { getByPlaceholderText } = render(<App />);
    expect(getByPlaceholderText('Write your note...')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/App.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement App.tsx and index.js**

Connect `SafeAreaProvider`, `ThemeProvider`, `NotesProvider`, deep linking listeners, and modal sheets.

- [ ] **Step 4: Run all test suites across the project**

Run: `npm test`
Expected: All test suites PASS (theme, storage, markdown, editor, archive, settings, notification, app).

- [ ] **Step 5: Commit**

```bash
git add App.tsx index.js tests/App.test.tsx
git commit -m "feat: complete Zero Note root application integration"
```
