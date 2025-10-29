# Admin Front-End Scaffold

This directory is reserved for a richer administrative dashboard (React, Vue, or similar) should you decide to replace the default EJS view that ships with the Express server. The API currently renders a lightweight server-side view at `/api/admin`, but you can build a SPA here and serve it via Express static middleware or a dedicated front-end deployment.

Suggested workflow:

1. Initialize your chosen framework inside this folder (`npm create vite@latest`, `npx create-react-app`, etc.).
2. Configure the build output directory to be copied into `server/public/` (or similar) during deployment.
3. Update `src/routes/adminRoutes.js` to serve the compiled assets.

Until then, the existing `admin.ejs` view provides a placeholder UI for administrators.
