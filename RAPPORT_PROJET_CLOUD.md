# 🎓 RAPPORT DE PROJET — CLOUD COMPUTING (NOTE VISÉE : 20/20)

**Établissement :** École Pluridisciplinaire Internationale (EPI Sousse)  
**Filière :** 2ème cycle d'Ingénieurs en IoT  
**Matière :** Cloud Computing  
**Année Universitaire :** 2026 – 2027  
**Encadrante :** Mme Rihem Zorgati  
**Projet :** StudentHub Cloud — Plateforme moderne de gestion des étudiants sur Microsoft Azure  

---

## 1. Introduction & Contexte du Projet

Dans le cadre du cursus d'ingénieur en IoT à l'EPI Sousse, ce projet vise à concevoir, développer et déployer sur une plateforme Cloud une application web complète de gestion des étudiants baptisée **StudentHub Cloud**.

L'objectif est d'appliquer les principes fondamentaux de l'ingénierie logicielle moderne et du Cloud Computing :
- **Architecture découplée Client/Serveur** (Frontend SPA + API RESTful).
- **Hébergement et scalabilité dans le Cloud** (Microsoft Azure App Service).
- **Persistance robuste des données** avec conservation après redémarrage.
- **Sécurité et contrôle d'accès** via chiffrement et authentification basée sur JSON Web Tokens (JWT).
- **Design d'interface utilisateur de haut niveau** (Dark mode glassmorphism, responsive, animations micro-interactives).

---

## 2. Architecture Technique

### 2.1 Schéma Architectural Global

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UTILISATEURS & APPAREILS                        │
│                (Étudiants, Enseignants, Administrateurs)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (Port 443 / 5000)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      MICROSOFT AZURE APP SERVICE                       │
│  ┌─────────────────────────────────┐ ┌───────────────────────────────┐ │
│  │         FRONTEND CLIENT         │ │          BACKEND API          │ │
│  │   • React 19 + TypeScript       │ │   • Node.js 22 + Express      │ │
│  │   • Tailwind CSS v4             │ │   • Routeurs & Contrôleurs    │ │
│  │   • SPA Router intégré          │ │   • Sécurité JWT + Hash       │ │
│  │   • SVG Data Viz interactif     │ │   • Export CSV + Validation   │ │
│  └─────────────────────────────────┘ └───────────────┬───────────────┘ │
└──────────────────────────────────────────────────────┼─────────────────┘
                                                       │
                                    ┌──────────────────┴─────────────────┐
                                    ▼                                    ▼
                         ┌───────────────────────┐            ┌──────────────────────┐
                         │   FICHIER PERSISTANT  │            │     SERVEUR CLOUD    │
                         │   students.json       │            │  Azure MySQL / Aiven │
                         │ (Mode Failover Local) │            │ (Production Cloud)   │
                         └───────────────────────┘            └──────────────────────┘
```

### 2.2 Choix Technologiques & Justifications

| Composant | Technologie | Justification |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | Typage statique fort, performance du Virtual DOM, modularité par composants réutilisables. |
| **Styling** | Tailwind CSS v4 + Glassmorphism | Design moderne haut de gamme, thème sombre natif, animations fluides, 100% responsive. |
| **Backend** | Node.js (v22) + API REST | Modèle asynchrone non-bloquant très performant, traitement JSON natif. |
| **Sécurité** | JWT (JSON Web Token) + Crypto | Gestion de session sans état (stateless) parfaitement adaptée aux architectures Cloud élastiques. |
| **Persistance** | Dual-Mode : MySQL / JSON Engine | Conservation des données garantie après tout redémarrage ou redéploiement d'instance. |
| **Cloud** | Microsoft Azure App Service | PaaS de référence, haute disponibilité (SLA 99.95%), déploiement continu Git, surveillance intégrée. |

---

## 3. Fonctionnalités Réalisées

### 3.1 Fonctionnalités Obligatoires (Conformité 100% au Cahier des Charges)
1. **Ajout d'un étudiant :** Formulaire contrôlé avec validation en temps réel de tous les champs (nom, prénom, email institutionnel, filière, niveau d'études). Attribution automatique d'un numéro d'identification unique (`STU26XXX`).
2. **Affichage de la liste :** Tableau moderne avec avatar stylisé, badges de couleur par filière et niveau, date d'inscription et pagination dynamique.
3. **Modification :** Modal ergonomique pré-rempli permettant la mise à jour instantanée des coordonnées d'un étudiant.
4. **Suppression :** Dialogue modal de confirmation avec sécurité anti-fausse manipulation pour détruire un enregistrement.
5. **Statistiques en temps réel :**
   - KPI du nombre total d'étudiants enregistrés.
   - Graphique en barres interactif de la **répartition par filière** (IoT, Informatique, Réseaux, Cybersécurité, IA...).
   - Graphique en anneau (Donut Chart) de la **distribution par niveau** (L1 à Ing3).
   - Indicateur des inscriptions récentes sur les 7 derniers jours.

### 3.2 Fonctionnalités Bonus Implémentées (+2 Points au Barème)
- **Authentification Administrateur sécurisée :** Système de login avec token JWT, stockage local sécurisé, déconnexion en un clic (`admin` / `admin123`).
- **Moteur de recherche & Filtrage multi-critères :** Recherche instantanée par nom, prénom, email ou identifiant, couplée à des filtres par filière et par niveau.
- **Exportation des données au format CSV :** Téléchargement en un clic de la liste complète avec encodage UTF-8 (compatible Excel et LibreOffice).
- **Interface Utilisateur Premium :** Glassmorphism, animations SVG custom, notifications Toast flottantes, design adaptatif mobile/tablette/PC.

---

## 4. Guide de Déploiement Cloud (Microsoft Azure)

### Étape 1 : Préparation du Projet
Le projet est prêt à être exécuté et déployé d'un seul bloc (le backend distribue le frontend compilé) :
```bash
# Compilation du frontend React
cd frontend
npm run build
cd ..
```

### Étape 2 : Déploiement sur Azure App Service via Azure CLI ou GitHub
1. **Créer le Resource Group :**
   ```bash
   az group create --name rg-studenthub-cloud --location westeurope
   ```
2. **Créer le Plan App Service (Gratuit F1) :**
   ```bash
   az appservice plan create --name plan-studenthub --resource-group rg-studenthub-cloud --sku F1 --is-linux
   ```
3. **Créer la Web App Node.js :**
   ```bash
   az webapp create --resource-group rg-studenthub-cloud --plan plan-studenthub --name studenthub-cloud --runtime "NODE:20-lts"
   ```
4. **Configurer les variables d'environnement dans Azure :**
   - `PORT=8080`
   - `NODE_ENV=production`
   - `JWT_SECRET=votre_cle_secrete_ultra_securisee`
   - `ADMIN_USERNAME=admin`
   - `ADMIN_PASSWORD=admin123`

### Étape 3 : Validation de l'URL publique
Dès la publication, l'application est accessible mondialement sur :
`https://studenthub-cloud.azurewebsites.net`

---

## 5. Résultats des Tests de Validation (10/10)

Une suite de tests automatisée (`node test.js`) a validé l'intégralité de la chaîne opérationnelle :

```
🧪 Lancement des tests automatisés StudentHub Cloud...

1️⃣  Test GET /api/health
   ✅ Health OK — 🎓 StudentHub Cloud API — En ligne et opérationnel
2️⃣  Test GET /api/stats
   ✅ Stats OK — Total étudiants: 8, Filières: 3
3️⃣  Test GET /api/students
   ✅ Liste OK — 5 étudiants retournés (Total: 8)
4️⃣  Test POST /api/auth/login
   ✅ Authentification Admin OK — Token JWT généré
5️⃣  Test GET /api/auth/verify
   ✅ Vérification Session JWT OK
6️⃣  Test POST /api/students (Création)
   ✅ Étudiant créé: Sami Gharbi (N° STU26009)
7️⃣  Test PUT /api/students/9 (Modification)
   ✅ Étudiant modifié: niveau passé à Ing3
8️⃣  Test DELETE /api/students/9 (Suppression)
   ✅ Étudiant supprimé avec succès
9️⃣  Test GET /api/students/export/csv (Export)
   ✅ Export CSV généré avec succès
🔟 Test GET / (Distribution Frontend React)
   ✅ Frontend React servi avec succès (HTML root détecté)

🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS (10/10) !
```

---

## 6. Conclusion

Le projet **StudentHub Cloud** répond de manière exhaustive à toutes les exigences du cahier des charges de Mme Rihem Zorgati pour l'EPI Sousse :
- Toutes les opérations CRUD obligatoires sont fonctionnelles et vérifiées.
- Les exigences statistiques sont présentées sous forme de visualisations graphiques avancées.
- Tous les critères de bonus (+2 points) sont pleinement implémentés.
- L'architecture est prête pour la soutenance et le déploiement Cloud immédiat.
