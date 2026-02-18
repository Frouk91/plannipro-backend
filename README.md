# PlanniPro — API Backend

Backend REST pour le planning de présence.  
Stack : **Node.js · Express · PostgreSQL**

---

## 🏗️ Architecture du projet

```
planning-backend/
├── src/
│   ├── index.js              ← Point d'entrée Express
│   ├── db/
│   │   └── pool.js           ← Connexion PostgreSQL
│   ├── middleware/
│   │   └── auth.js           ← JWT + vérification des rôles
│   └── routes/
│       ├── auth.js           ← Login, register, refresh token
│       ├── agents.js         ← CRUD agents & équipes
│       └── leaves.js         ← Demandes de congés
├── sql/
│   └── schema.sql            ← Schéma de base de données
├── .env.example              ← Template de configuration
├── package.json
└── README.md
```

---

## ⚡ Installation rapide

### 1. Prérequis
- Node.js 18+
- PostgreSQL 14+

### 2. Cloner et installer
```bash
git clone <votre-repo>
cd planning-backend
npm install
```

### 3. Configurer l'environnement
```bash
cp .env.example .env
# Editez .env avec vos paramètres DB et vos clés JWT
```

### 4. Créer la base de données
```bash
# Dans PostgreSQL
createdb planning_presence

# Appliquer le schéma
psql -d planning_presence -f sql/schema.sql
```

### 5. Lancer le serveur
```bash
npm run dev     # Développement (avec rechargement automatique)
npm start       # Production
```

L'API démarre sur **http://localhost:3001**

---

## 🔐 Authentification

L'API utilise **JWT** avec double token :
- `accessToken` : durée de vie courte (15 min)
- `refreshToken` : durée de vie longue (7 jours), stocké en DB

### Rôles disponibles
| Rôle | Droits |
|------|--------|
| `agent` | Voir ses propres congés, créer des demandes |
| `manager` | Approuver/refuser les demandes, voir tous les agents |
| `admin` | Tout + gestion des comptes |

---

## 📡 Endpoints de l'API

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| POST | `/api/auth/refresh` | Rafraîchir le token |
| POST | `/api/auth/logout` | Se déconnecter |
| GET  | `/api/auth/me` | Profil courant |

### Agents
| Méthode | Route | Description |
|---------|-------|-------------|
| GET  | `/api/agents` | Liste tous les agents |
| GET  | `/api/agents/:id` | Détail d'un agent |
| PUT  | `/api/agents/:id` | Modifier un agent |
| DELETE | `/api/agents/:id` | Désactiver un agent (admin) |
| GET  | `/api/agents/meta/teams` | Liste des équipes |
| POST | `/api/agents/meta/teams` | Créer une équipe |

### Congés
| Méthode | Route | Description |
|---------|-------|-------------|
| GET  | `/api/leaves` | Liste des demandes |
| GET  | `/api/leaves/planning?year=2025&month=6` | Planning mensuel |
| POST | `/api/leaves` | Créer une demande |
| PATCH | `/api/leaves/:id/approve` | Approuver (manager) |
| PATCH | `/api/leaves/:id/reject` | Refuser (manager) |
| DELETE | `/api/leaves/:id` | Annuler |

---

## 📖 Exemples de requêtes

### Connexion
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "sophie@entreprise.fr", "password": "motdepasse"}'
```

### Créer une demande de congé
```bash
curl -X POST http://localhost:3001/api/leaves \
  -H "Authorization: Bearer <votre_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leave_type_code": "cp",
    "start_date": "2025-07-14",
    "end_date": "2025-07-25",
    "reason": "Vacances d été"
  }'
```

### Planning du mois de juin
```bash
curl "http://localhost:3001/api/leaves/planning?year=2025&month=6" \
  -H "Authorization: Bearer <votre_token>"
```

---

## 🚀 Déploiement en production

### Option recommandée : Railway (gratuit jusqu'à 5$/mois)
1. Créez un compte sur [railway.app](https://railway.app)
2. Nouveau projet → Deploy from GitHub
3. Ajoutez un service PostgreSQL dans le même projet
4. Copiez les variables d'environnement dans Railway
5. C'est déployé ! ✅

### Option alternative : Render.com
1. Créez un compte sur [render.com](https://render.com)
2. New Web Service → connectez votre repo GitHub
3. Build Command : `npm install`
4. Start Command : `npm start`
5. Ajoutez une base PostgreSQL gratuite (90 jours)

---

## 🔧 Checklist avant mise en production

- [ ] Changer les clés `JWT_SECRET` et `JWT_REFRESH_SECRET` (min. 32 caractères aléatoires)
- [ ] Mettre `NODE_ENV=production`
- [ ] Configurer HTTPS (géré automatiquement par Railway/Render)
- [ ] Restreindre `FRONTEND_URL` à votre domaine réel
- [ ] Configurer les sauvegardes automatiques PostgreSQL

---

## 🔗 Intégration avec le frontend React

Dans votre app React, créez un fichier `api.js` :

```javascript
const BASE_URL = 'http://localhost:3001/api';

// Récupérer le planning mensuel
export async function getPlanning(year, month) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${BASE_URL}/leaves/planning?year=${year}&month=${month}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// Créer une demande de congé
export async function createLeave(data) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${BASE_URL}/leaves`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
}
```
