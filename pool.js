const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
```

Sauvegardez avec **Ctrl+S**, vérifiez qu'il n'y a pas de `git add` dans le fichier, puis dans la fenêtre **cmd** :
```
git add pool.js
git commit - m "Fix pool DB"
git push