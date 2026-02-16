# Project Onboarding Guide

## Overview

This project is a **Chrome Extension** designed to improve the course registration experience on Workday for UBC students. It injects a "side-by-side" calendar view into the Workday website, allowing users to visualize their schedule, manage worklists, and view course conflicts in real-time.

The project is built using:
- **React** (v18) for the UI.
- **TypeScript** for type safety.
- **Esbuild** for bundling.
- **Jest** for testing.

## Folder Structure

The codebase is organized as follows:

- **`src/`**: Contains all the source code.
  - **`backends/`**: Logic for fetching data from external sources.
    - `workday/`: Scripts to parse and scrape data from Workday pages.
    - `rateMyProf/`: logic to fetch professor ratings from RateMyProf.
  - **`background/`**: The extension's background script (service worker). Handles event listeners and communication.
  - **`content/`**: Code that runs in the context of the Workday web page.
    - `index.tsx`: The entry point. It injects the React app into the page and handles the toggling of the side drawer.
    - `App/`: The main React component (`App.tsx`) and its subcomponents.
    - `Calendar/`, `CalendarControls/`, `SectionDetails/`: Specific UI components.
  - **`domManipulators/`**: Helper scripts to interact with the raw DOM of the Workday page (e.g., adding buttons, scraping content).
  - **`objects/`**: Core data models and business logic.
  - **`public/`**: Static assets and the `manifest.json`.

## Key Components & Objects

### 1. Data Models (`src/objects/`)

These classes are the backbone of the application's logic.

- **`ExtensionEventChannel` (`ExtensionEventChannel.ts`)**:
  - **Purpose**: Provides a centralized channel for ephemeral communication using `CustomEvent`.
  - **Functionality**:
    - Dispatches loading events (`extensionLoadingState`) with progress and messages.
    - Currently used for showing progress bars in the UI during heavy operations like schedule imports.

- **`ExtensionStorage` (`ExtensionStorage.ts`)**:
  - **Purpose**: Acts as the single source of truth for the application's state. It wraps `chrome.storage.local`.
  - **Functionality**: Saves and retrieves the user's `Schedule`, `currentTerm`, `preferences`, etc.
  - **Usage**: Used by React components to persist state and by background scripts to read settings.

- **`Schedule` (`Schedule.ts`)**:
  - **Purpose**: Represents the user's entire schedule, consisting of a list of `Section` objects.
  - **Functionality**:
    - **Conflict Detection**: Checks if a new section conflicts with existing ones (`getConflictSections`).
    - **Color Management**: Assigns unique colors to courses (`getCourseColor`).
    - **Import/Export**: Handles downloading the schedule as JSON and importing from JSON (`getScheduleFromExternalJSON`).
    - **Session/Worklist Management**: Filters sections by session/worklist.

- **`Section` (`Section.ts`)**:
  - **Purpose**: Represents a single course section (e.g., "CPSC 110 101").
  - **Functionality**:
    - Stores metadata: `code`, `instructors`, `time`, `location`, `color`, etc.
    - Logic for:
      - Exporting to JSON.
      - Checking conflicts (via `getSectionSchedule`).
      - Fetching historical grades (via `getHistoricalGrades`).
  - **Key Method**: `getSectionSchedule(term)` returns the specific time blocks for a given term.


- **`SectionDetail` (`SectionDetail.ts`)**:
  - **Purpose**: Represents a specific meeting time/location for a section (e.g., "Mon Wed Fri 10:00-11:00 at DMP 110").
  - **Functionality**:
    - Stores `terms`, `days`, `startTime`, `endTime`, `location`, etc.
    - Exportable to JSON.
    - A `Section` object may contains a list of these `SectionDetail` objects (Since workday often breaks up a course into multiple sections due to reading break).


### 2. Content Scripts (`src/content/`)

- **`index.tsx`**:
  - **Purpose**: The "bootloader" of the extension.
  - **Functionality**:
    - Listens for DOM changes to inject buttons (via `domManipulators`).
    - Creates the "Side Drawer" (container for the React app).
    - Mounts the `App` component into the drawer.
    - Handles the open/close state of the drawer.

- **`App` (`src/content/App/App.tsx`)**:
  - **Purpose**: The main container for the UI.
  - **Functionality**: Manage the high-level state (passed down to Calendar, Controls, etc.) and syncs with `ExtensionStorage`.

### 3. Backends (`src/backends/`)

- **`workday/`**:
  - **Purpose**: Interfacing with Workday's internal data or DOM structure.
  - **`idSearchApi.ts`**: Helper to fetch course details using Workday's internal IDs.
  - **`nodeSearchHelpers.ts`**: Utilities to traverse Workday's complex DOM tree to find specific elements (like course titles or times).

## Typical Workflow

1.  **User Interaction**: The user navigates to a course page on Workday.
2.  **DOM Manipulation**: `domManipulators` detect the course information and inject "Add to Schedule" buttons.
3.  **Action**: User clicks "Add".
4.  **Parsing**: The extension scrapes the course data and creates a `Section` object.
5.  **Storage**: The `Section` is added to a `Schedule` and saved via `ExtensionStorage` to `chrome.storage.local`.
6.  **Reactivity**: The React `App` listens for storage changes and re-renders the `Calendar` component to show the new section.

## Setup & Development

- **Installation**: `yarn install`
- **Build**: `yarn build-chrome` (or `yarn dev-chrome` for watch mode).
- **Load in Browser**:
  1.  Go to `chrome://extensions`.
  2.  Enable "Developer mode".
  3.  Click "Load unpacked".
  4.  Select the `build` directory (generated after running the build script).

## Before Creating a PR

- **Tests**: `yarn run test`
- **Linter**: `yarn run lint`
- **Formatter**: `yarn run fmt` to auto format code, run `yarn run fmt-fix`
