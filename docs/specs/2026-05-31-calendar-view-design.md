# Calendar View — Design Spec

**Date:** 2026-05-31
**Status:** Approved

---

## Purpose

Add a hybrid calendar view (mini month grid + detail panel) to the dashboard and plan pages. Users can toggle between the existing week-card list view and the new calendar view.

---

## Component: TrainingCalendar

A client component rendering:

### Left Panel — Month Grid
- 7-column grid (Mon–Sun) showing day numbers
- Color-coded cells based on workout status:
  - Green: completed
  - Blue: upcoming
  - Yellow: modified
  - Red: missed
  - Gray: off/rest/no workout
- Today's date has a highlighted ring
- Month navigation via left/right arrows above the grid
- Days without workouts are plain (no color)

### Right Panel — Day Detail
- Shows when a day with a workout is clicked
- Displays: day name, date, prescribed workout, status badge
- Shows logged metrics if available (miles, HR, effort)
- Shows calendar conflict warning if one exists for that date (future: Plan 5)
- Link to full workout detail page (`/plan/[planId]/workout/[workoutId]`)
- When no day is selected, shows a prompt: "Click a day to see details"

### Responsive
- On small screens, the detail panel moves below the calendar grid (stacked layout)
- Grid cells shrink but remain tappable

---

## Component: ViewToggle

A `Tabs` component (shadcn/ui) with two values: `calendar` and `list`.

- Placed at the top of both dashboard and plan pages, right-aligned next to the page heading
- View state stored in URL search param `?view=calendar` or `?view=list`
- Defaults to `calendar`
- When `list` is selected, the existing week-card view renders
- When `calendar` is selected, the TrainingCalendar renders

---

## Integration Points

### Dashboard (`/dashboard`)
- ViewToggle appears next to "This Week" heading
- Calendar view shows the full month with the current plan's workouts
- List view shows the existing WeekCard for the current week (unchanged)

### Plan Page (`/plan/[planId]`)
- ViewToggle appears next to the plan title
- Calendar view shows all months that have workouts, defaulting to the current month
- List view shows the existing stacked WeekCards (unchanged)

---

## Data Flow

- Both views consume the same data: workouts with `date`, `prescribed_workout`, `status`, `miles`, `perceived_effort`, `day_of_week`, `id`
- The plan page already fetches weeks with nested workouts — the calendar flattens this into a date-indexed map
- The dashboard already fetches the current week — the calendar additionally needs all workouts for the current month (a slightly wider query)
- Day detail uses data already loaded (no extra fetch needed for basic info)

---

## Files

| File | Action | Purpose |
|------|--------|---------|
| `src/components/training-calendar.tsx` | Create | Hybrid calendar component (client) |
| `src/components/calendar-day-detail.tsx` | Create | Right-side detail panel |
| `src/components/view-toggle.tsx` | Create | Calendar/List tabs |
| `src/app/(protected)/plan/[planId]/page.tsx` | Modify | Add toggle + calendar view |
| `src/app/(protected)/dashboard/page.tsx` | Modify | Add toggle + calendar view, widen query to full month |

---

## No New Database Changes

The calendar is purely a UI layer over existing data. No migrations, RLS changes, or new server actions needed.
