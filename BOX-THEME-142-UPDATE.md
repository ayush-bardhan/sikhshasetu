# ShikshaSetu — v142 Box Theme Integration

The complete project now uses one authoritative visual layer, `moss-box-theme-142.css`, on both entry points:

- `dashboard.html` loads `styles.css` followed by `moss-box-theme-142.css`.
- `index.html` loads `styles.css`, `login.css`, then `moss-box-theme-142.css`.
- Light mode uses `assets/moss-surface-light.jpg`; dark mode uses `assets/moss-surface-dark.jpg`.
- `assets/moss-panel-frame.png` supplies the organic frame/highlight layer.

The dashboard, student directory, assessment, mentor support, AI Admin, fairness, feedback, modal, filter, table, form-control, and login/account surfaces share the same v142 box material. The sidebar, hero and nested table regions retain their appropriate lower-noise variants so text and controls remain readable.

No JavaScript files were changed. In particular, `app.js`, `login.js`, `theme-controller.js`, `dashboard-session.js`, and `nature-gallery.js` remain the original behavior sources. Backend files and API contracts are retained.

## Maintenance rule

For future visual edits, change `moss-box-theme-142.css` first and keep both HTML entry points linked to it. Do not duplicate theme patches in `styles.css` or `login.css`, and do not alter JavaScript unless a behavior change is explicitly requested. Keep all referenced assets in `assets/`.
