# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

Added notes for Mood Tracking Dashboard

- The dashboard now fetches mood data from the backend endpoint `/tracks` and correlation insights from `/correlation`.
- Make sure your VITE_API_URL environment variable is set to the API gateway or mood-service URL (e.g. `http://localhost:3003` for mood-service alone).

Example: start the mood service and domain-classifier, then run the frontend (Vite). The dashboard will request dynamic daily/weekly/monthly data and correlation insights.
