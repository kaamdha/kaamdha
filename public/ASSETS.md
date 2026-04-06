# Public assets directory (`/public/assets/`)

All images and icons used on kaamdha.com. Replace any file with a same-named file to update site-wide.

---

## Logos & branding

| File | Status | Used in | Purpose |
|---|---|---|---|
| `logo-full-light.png` | IN USE | `logo.tsx` | Full logo (light bg), shown in header |
| `logo-icon-light.png` | IN USE | `logo.tsx` | Icon-only logo (light bg), mobile header |
| `logo-full-dark.png` | NOT IN USE | — | Full logo for dark backgrounds |
| `og-image.png` | IN USE | `layout.tsx`, listing/job detail metadata | Link preview image (WhatsApp, social media, SMS). Replace with 1200x630 image. |
| `app-icon.png` | NOT IN USE | — | Source app icon |

## Favicons & PWA

| File | Status | Used in | Purpose |
|---|---|---|---|
| `favicon.png` | IN USE | `layout.tsx` | Browser tab icon (32x32) |
| `icon-192.png` | IN USE | `layout.tsx` | PWA / Android home screen (192x192) |
| `icon-512.png` | NOT IN USE | — | PWA splash (512x512), may be needed in manifest |
| `apple-touch-icon.png` | IN USE | `layout.tsx` | iOS home screen icon |
| `favicon-source.png` | NOT IN USE | — | High-res source for generating favicons |

## Hero images

| File | Status | Used in | Purpose |
|---|---|---|---|
| `hero-staff.png` | IN USE | `home-landing.tsx`, `home-employer.tsx`, `worker-profile-editor.tsx` | Hero illustration on landing, employer home, worker profile |

## Avatars

| File | Status | Used in | Purpose |
|---|---|---|---|
| `avatar-male.png` | IN USE | `worker-card.tsx`, `worker-detail.tsx` | Default male avatar |
| `avatar-female.png` | IN USE | `worker-card.tsx`, `worker-detail.tsx` | Default female avatar |

## Navigation & action icons

| File | Status | Used in | Purpose |
|---|---|---|---|
| `bookmark.png` | IN USE | `worker-card.tsx`, `worker-detail.tsx`, `job-detail.tsx`, `home-worker.tsx`, `favorites-view.tsx`, `header.tsx` | Unfavorited/empty bookmark icon |
| `bookmark-nav.png` | IN USE | Same as above | Filled/active bookmark icon |
| `edit.png` | IN USE | `account-menu.tsx`, `edit-icon.tsx` | Edit pencil icon |
| `share.png` | IN USE | `share-icon.tsx` | Share icon |

## Account menu icons

| File | Status | Used in | Purpose |
|---|---|---|---|
| `job-listing.png` | IN USE | `account-menu.tsx` | Job listings menu item icon |
| `help-support.png` | IN USE | `account-menu.tsx` | Help & support menu item icon |

## Empty state illustrations

| File | Status | Used in | Purpose |
|---|---|---|---|
| `no-results.png` | IN USE | `employer-search.tsx`, `home-worker.tsx`, `staff-listings.tsx`, `job-listings.tsx` | No search results illustration |
| `no-content.png` | IN USE | `favorites-view.tsx` | Empty favorites/saved tab |
| `no-contact.png` | IN USE | `favorites-view.tsx` | No contacts revealed yet |
