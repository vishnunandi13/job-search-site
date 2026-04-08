# JobBoard.io (GitHub Deploy Ready)

This is a production-ready static app version of your original `index.html` prototype.

## Features

- Browse, search, filter, and sort jobs
- Save/unsave jobs (saved in browser local storage)
- Apply to jobs with a form modal (application state persists)
- Add custom jobs from the UI (also persisted)
- Works on desktop and mobile
- No build step required (pure HTML/CSS/JS)

## Project Files

- `index.html`
- `styles.css`
- `app.js`

## Run Locally

Open `index.html` directly in a browser.

## Deploy to GitHub Pages

1. Create a GitHub repository and push these files.
2. In GitHub, open `Settings` -> `Pages`.
3. Under `Build and deployment`, set:
   - Source: `Deploy from a branch`
   - Branch: `main` (or your default branch)
   - Folder: `/ (root)`
4. Save and wait for Pages to publish.

Your app will be available at:

`https://<your-github-username>.github.io/<repo-name>/`

## Notes

- This app stores saved/applied/custom job data in each user's browser (`localStorage`).
- If you want multi-user accounts and shared data, we can add a backend next.
