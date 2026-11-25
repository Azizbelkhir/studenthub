# 🎓 StudentHub Cloud

> **Mini-projet Cloud Computing** · EPI Sousse · IoT · Année universitaire 2026-2027  
> Encadrante : **Rihem Zorgati**

[![Azure](https://img.shields.io/badge/Azure-App%20Service-0078D4?logo=microsoftazure)](https://azure.microsoft.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql)](https://mysql.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)

---

## 📋 Description

Application web de **gestion des étudiants** hébergée sur **Microsoft Azure**.  
Permet aux administrateurs de gérer les informations des étudiants (CRUD complet) avec des statistiques visuelles.

### Fonctionnalités

| Fonctionnalité | Statut |
|---|---|
| ✅ Ajouter un étudiant | Obligatoire |
| ✅ Afficher la liste des étudiants | Obligatoire |
| ✅ Modifier les informations | Obligatoire |
| ✅ Supprimer un étudiant | Obligatoire |
| ✅ Statistiques par filière | Obligatoire |
| ✅ Statistiques par niveau | Obligatoire |
| ✅ Authentification admin JWT | **Bonus** |
| ✅ Recherche & filtrage | **Bonus** |
| ✅ Export CSV | **Bonus** |
| ✅ Graphiques interactifs | **Bonus** |
| ✅ Interface responsive | **Bonus** |

---

## 🏗️ Architecture

```
StudentHub-Cloud/
├── frontend/          ← React 19 + TypeScript + Tailwind v4 + Vite
│   └── src/
│       ├── components/    (Navbar, StatCard, Charts, StudentTable, Modals)
│       ├── pages/         (Dashboard, StudentsPage, LoginPage)
│       ├── services/      (api.ts — client fetch)
│       ├── context/       (AuthContext, ToastContext)
│       └── types/         (student.ts)
└── backend/           ← Node.js + Express + TypeScript + MySQL
    └── src/
        ├── config/        (database.ts, initDb.ts)
        ├── controllers/   (students, stats, auth)
        ├── routes/        (REST API routes)
        └── middleware/    (JWT auth, error handler)
```

**Plateforme Cloud** : Microsoft Azure App Service (Free Tier F1)

---

## 🚀 Installation & Lancement local

### Prérequis
- Node.js ≥ 18
- MySQL ≥ 8 (ou XAMPP)
- npm

### 1. Backend

```bash
cd backend
npm install
# Configurer .env (DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET)
npm run init-db     # Créer la DB + insérer données de test
npm run dev         # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
# Vérifier .env : VITE_API_URL=http://localhost:5000/api
npm run dev         # http://localhost:5173
```

### 3. Connexion Admin

```
Username : admin
Password : admin123
```

---

## 🌐 API REST

| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/health` | Statut de l'API | ❌ |
| POST | `/api/auth/login` | Connexion admin | ❌ |
| GET | `/api/students` | Liste + recherche + pagination | ❌ |
| GET | `/api/students/:id` | Détail étudiant | ❌ |
| POST | `/api/students` | Ajouter étudiant | ✅ JWT |
| PUT | `/api/students/:id` | Modifier étudiant | ✅ JWT |
| DELETE | `/api/students/:id` | Supprimer étudiant | ✅ JWT |
| GET | `/api/students/export/csv` | Export CSV | ❌ |
| GET | `/api/stats` | Statistiques globales | ❌ |

---

## ☁️ Déploiement Azure

### Étapes

1. **Créer un compte Azure** (azure.microsoft.com — Free avec 12 mois offerts)
2. **Azure Database for MySQL** → Créer un serveur flexible (Free Tier)
3. **Azure App Service** → Créer une Web App (Runtime: Node 20, Free F1)
4. **Configurer les variables d'environnement** dans App Service → Configuration
5. **Déployer** via ZIP Deploy ou GitHub Actions

### Variables Azure App Service (Configuration → Application settings)

```
DB_HOST       = <votre-serveur>.mysql.database.azure.com
DB_USER       = adminuser
DB_PASSWORD   = <votre-mot-de-passe>
DB_NAME       = studenthub_db
JWT_SECRET    = <secret-fort-aléatoire>
NODE_ENV      = production
PORT          = 8080
```

### URL publique

```
https://studenthub-cloud.azurewebsites.net
```

---

## 📊 Structure de la base de données

```sql
CREATE TABLE students (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  numero           VARCHAR(20) NOT NULL UNIQUE,
  nom              VARCHAR(100) NOT NULL,
  prenom           VARCHAR(100) NOT NULL,
  email            VARCHAR(200) NOT NULL UNIQUE,
  filiere          VARCHAR(100) NOT NULL,
  niveau           ENUM('L1','L2','L3','M1','M2','Ing1','Ing2','Ing3') NOT NULL,
  date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🛠️ Technologies utilisées

| Couche | Technologie | Justification |
|---|---|---|
| Frontend | React 19 + TypeScript | Framework moderne, type-safe |
| Styling | Tailwind CSS v4 + CSS custom | Design system rapide + glassmorphism |
| Routing | React Router v7 | Navigation SPA |
| Backend | Node.js + Express + TypeScript | Léger, performant, même langage |
| Base de données | MySQL | Relationnel, compatible Azure |
| Auth | JWT + bcryptjs | Standard industriel sécurisé |
| Hébergement | Microsoft Azure App Service | Plateforme cloud leader |
| Build | Vite | Build ultra-rapide |
| Versioning | Git + GitHub | Collaboration & CI/CD |

---

## 👨‍🎓 Livrables

- ✅ Code source sur GitHub : `https://github.com/[username]/StudentHub-Cloud`
- ✅ URL publique Azure : `https://studenthub-cloud.azurewebsites.net`
- ✅ Rapport synthétique (4-6 pages) avec captures d'écran

---

*EPI Sousse · 2ème cycle Ingénieurs IoT · Cloud Computing 2026-2027*
