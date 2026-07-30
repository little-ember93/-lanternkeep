# Lanternkeep

Lanternkeep is a gentle, mobile-first daily tending app.

## Privacy

The files in this repository contain only the generic app shell and generic starter examples.

Personal task names, gratitude text, settings, and daily completion data are stored in the browser on the device using local browser storage. They are not committed to this repository and are not sent to GitHub.

Local browser storage is not encrypted. Anyone using an unlocked device may be able to see the app data, and clearing browser/site data can erase it. Lanternkeep includes a manual JSON export/import backup option.

## Publish with GitHub Pages

1. Upload every file in this folder to the root of a public GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/(root)`, then save.
5. Wait for GitHub to show the published address.

The app uses only HTML, CSS, and JavaScript. There are no paid services and no outside tracking libraries.


## Version 1.1

- Moves resident reactions into a compact row directly beneath the living scene.
- Keeps the latest resident message visible for the rest of the day.
- Adds a gentle date and daypart line.
- Adds a fresh-day greeting with no countdown, streak, or overdue language.
- Removes the larger resident profile section for now.


## Version 1.2 — Gratitude Grove

- Adds a separate Gratitude Grove page.
- Saves one dated gratitude leaf per calendar day.
- Updating today’s gratitude updates today’s existing leaf instead of creating duplicates.
- Groups leaves into monthly branches and lets the user tap each leaf to reread it.
- Missing days create no blank leaf, broken chain, warning, or penalty.
- Includes Grove history in the existing local backup/export data.
- Adds pathways to the Grove from the small tree and gratitude section.
