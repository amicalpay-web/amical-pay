# 🚀 AmicalPay - Guide de Déploiement Complet sur Render

## 📋 Vue d'ensemble

AmicalPay est une application full-stack composée de:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Frontend (React/Vite)                                      │
│  https://amical-pay-frontend.onrender.com                   │
│                                                             │
│         ↓ HTTPS (CORS Protected)                            │
│                                                             │
│  Backend API (Node.js/Express)                              │
│  https://amical-pay-api.onrender.com                        │
│  - FazerCards Integration                                   │
│  - Secure API Key Management                                │
│  - Admin Authentication                                     │
│                                                             │
│         ↓ HTTPS                                             │
│                                                             │
│  FazerCards API (External)                                  │
│  https://api.fzr.cards/api/v2                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Prérequis

### Avant de commencer

- ✅ **GitHub Repository**: `amicalpay-web/amical-pay` - Push effectué
- ✅ **Compte Render**: [render.com](https://render.com) (gratuit ou payant)
- ✅ **Render Plan**: Starter Plan (suffisant pour tester)
- ✅ **FazerCards API Key**: Clé valide de [FazerCards Dashboard](https://dashboard.fazercards.com)
- ✅ **Fichiers Configurés**:
  - `render.yaml` ✓ (Backend Blueprint)
  - `backend/package.json` ✓
  - `backend/.env.example` ✓
  - `frontend/package.json` ✓
  - `vite.config.ts` ✓ (FAZER_API_KEY bloquée)

---

## 🔧 Étape 1: Déployer le Backend (Backend Blueprint)

### 1.1 Connecter le Repository GitHub à Render

1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Cliquez **"New +"** → **"Blueprint"**
3. Cherchez votre repository: `amicalpay-web/amical-pay`
4. Cliquez **"Connect"**
5. Sélectionnez la branche: **`main`**
6. Cliquez **"Next"**

### 1.2 Render lit le `render.yaml`

Render détecte automatiquement:

```yaml
services:
  - type: web_service
    name: amical-pay-api
    env: node
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    envVars:
      - NODE_ENV = production
      - FAZER_API_KEY = fromSecret (à configurer)
      - ADMIN_TOKEN = fromSecret (à configurer)
      - FRONTEND_URL = https://amical-pay-frontend.onrender.com
      - LOG_LEVEL = info
```

### 1.3 Ajouter les Secrets Render

**Render affiche un formulaire pour les secrets:**

#### Secret 1: FAZER_API_KEY

```
┌─────────────────────────────────────────────────────────────┐
│ Add Secret                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Name:    FAZER_API_KEY                                      │
│ Value:   [votre_clé_api_fazer_ici]                          │
│          (copier depuis FazerCards Dashboard)               │
│                                                             │
│ [Save Secret]                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Pour obtenir votre clé:**
1. Allez sur [FazerCards Dashboard](https://dashboard.fazercards.com)
2. Settings → API Keys
3. Copiez votre clé API active
4. Collez-la dans le champ Render

#### Secret 2: ADMIN_TOKEN

```
┌─────────────────────────────────────────────────────────────┐
│ Add Secret                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Name:    ADMIN_TOKEN                                        │
│ Value:   [token_sécurisé_aléatoire]                         │
│                                                             │
│ Générer un token:                                           │
│ node -e "console.log(crypto.randomBytes(32)                │
│           .toString('hex'))"                                │
│                                                             │
│ Exemple:                                                    │
│ a7f3c8d9e2b4f1a6c5d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9
│                                                             │
│ [Save Secret]                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Déployer le Backend

1. Après avoir ajouté les 2 secrets
2. Cliquez **"Deploy"**
3. Render:
   - ✅ Clone le repository
   - ✅ Exécute `cd backend && npm install && npm run build`
   - ✅ Injecte les secrets (FAZER_API_KEY, ADMIN_TOKEN)
   - ✅ Lance `cd backend && npm start`
   - ✅ Allocue une URL: `https://amical-pay-api.onrender.com`

### 1.5 Vérifier le Déploiement du Backend

**Dans Render Dashboard:**

```
Services
└── amical-pay-api (Web Service)
    ├── Status: Live ✅
    ├── URL: https://amical-pay-api.onrender.com
    ├── Events (logs en temps réel)
    └── Logs (voir les messages du serveur)
```

**Tester la connexion:**

```bash
# Health check
curl https://amical-pay-api.onrender.com/health

# Réponse attendue:
# {
#   "status": "ok",
#   "timestamp": "2024-09-13T22:30:00.000Z",
#   "environment": "production"
# }
```

**Tester FazerCards:**

```bash
# Vérifier la connexion FazerCards
curl https://amical-pay-api.onrender.com/api/fazer/health

# Réponse attendue:
# {
#   "status": "SUCCESS",
#   "timestamp": "2024-09-13T22:30:00.000Z",
#   "apiKeySet": true,
#   "fazerApiReachable": true,
#   "authenticationValid": true,
#   "categoriesCount": 5
# }
```

---

## 🎨 Étape 2: Déployer le Frontend (Static Site Manuel)

⚠️ **Important**: Render Blueprint ne supporte pas encore `static_site`. Déployez le frontend manuellement.

### 2.1 Créer un nouveau Static Site

1. Render Dashboard → **"New +"** → **"Static Site"**
2. Cherchez votre repository: `amicalpay-web/amical-pay`
3. Cliquez **"Connect"**

### 2.2 Configurer le Build

```
┌─────────────────────────────────────────────────────────────┐
│ Configure Your Site                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Name:              amical-pay-frontend                      │
│ Branch:            main                                     │
│ Build Command:     cd frontend && npm install && npm run build
│ Publish Directory: frontend/dist                            │
│ Root Directory:    (empty)                                  │
│                                                             │
│ [Create Static Site]                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Ajouter les Variables d'Environnement

Après création du Static Site:

1. Settings → **Environment Variables**
2. Ajouter une variable:

```
┌─────────────────────────────────────────────────────────────┐
│ Add Environment Variable                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Key:   VITE_API_URL                                         │
│ Value: https://amical-pay-api.onrender.com                  │
│                                                             │
│ [Save Variable]                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Déployer le Frontend

1. Cliquez **"Deploy"**
2. Render:
   - ✅ Clone le repository
   - ✅ Exécute `cd frontend && npm install && npm run build`
   - ✅ Injecte VITE_API_URL = https://amical-pay-api.onrender.com
   - ✅ Publie les fichiers depuis `frontend/dist`
   - ✅ Allocue une URL: `https://amical-pay-frontend.onrender.com`

### 2.5 Vérifier le Déploiement du Frontend

**Accéder au site:**

```
https://amical-pay-frontend.onrender.com
```

Vous devriez voir:
- ✅ L'interface AmicalPay en React
- ✅ Sélecteur de région (EU, LATAM, BR, MENA)
- ✅ Liste des produits Free Fire
- ✅ Aucune erreur CORS (frontend appelle le backend)

---

## 🔒 Sécurité - Vérification Finale

### Vérifier que les Secrets sont Protégés

```bash
# ✅ CECI NE DOIT PAS FONCTIONNER
# Vérifier qu'aucune clé API n'est exposée au frontend
curl https://amical-pay-frontend.onrender.com/config.js 2>/dev/null | grep FAZER_API_KEY
# Résultat: (vide - aucune clé trouvée) ✅

# ✅ CECI DOIT FONCTIONNER
# Vérifier que le backend peut utiliser la clé
curl https://amical-pay-api.onrender.com/api/fazer/health
# Résultat: {"status": "SUCCESS", ...} ✅
```

### Vérifier les Variables d'Environnement

**Render Dashboard → Web Service → Environment:**

```
✅ NODE_ENV = production (visible)
✅ LOG_LEVEL = info (visible)
✅ FRONTEND_URL = https://amical-pay-frontend.onrender.com (visible)
✅ FAZER_API_KEY = ****** (Secret - masquée) ✅ CORRECT
✅ ADMIN_TOKEN = ****** (Secret - masquée) ✅ CORRECT
```

---

## 🧪 Tests Complets

### Test 1: Health Check

```bash
curl https://amical-pay-api.onrender.com/health

# Réponse:
# {"status": "ok", "environment": "production"}
```

### Test 2: FazerCards Connection

```bash
curl https://amical-pay-api.onrender.com/api/fazer/health

# Réponse:
# {"status": "SUCCESS", "apiKeySet": true, "authenticationValid": true}
```

### Test 3: Récupérer les Catégories FazerCards

```bash
curl https://amical-pay-api.onrender.com/api/fazer/categories

# Réponse:
# {
#   "status": "success",
#   "count": 5,
#   "categories": [
#     {"id": "free_fire_latam", "name": "Free Fire Latam"},
#     ...
#   ]
# }
```

### Test 4: Récupérer les Produits Free Fire LATAM

```bash
curl https://amical-pay-api.onrender.com/api/fazer/offers/free_fire_latam

# Réponse:
# {
#   "status": "success",
#   "categoryId": "free_fire_latam",
#   "count": 8,
#   "offers": [
#     {
#       "id": "500_diamonds",
#       "name": "500 Diamantes",
#       "amount": 500,
#       "price": 9.99,
#       "currency": "USD"
#     },
#     ...
#   ]
# }
```

### Test 5: Valider un Player ID Free Fire

```bash
curl -X POST https://amical-pay-api.onrender.com/api/fazer/validate-player \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "123456789",
    "region": "LATAM"
  }'

# Réponse:
# {"status": "success", "valid": true, "playerId": "123456789"}
```

### Test 6: Frontend Appelle Backend

1. Allez sur https://amical-pay-frontend.onrender.com
2. Ouvrez DevTools (F12)
3. Console → Pas d'erreurs CORS ✅
4. Network → Les requêtes à `/api/faire/*` réussissent ✅
5. Les produits s'affichent correctement ✅

---

## 📊 Monitoring et Logs

### Voir les Logs du Backend

1. Render Dashboard → **amical-pay-api** → **Logs**
2. Cherchez:
   ```
   ✅ Configuration validated
   ✅ AmicalPay API Server
   ✅ Listening on port 10000 (port fourni par Render)
   ✅ Server ready to accept requests
   ```

### Voir les Logs du Frontend

1. Render Dashboard → **amical-pay-frontend** → **Logs**
2. Cherchez:
   ```
   ✅ Build successful
   ✅ Output Directory: frontend/dist
   ✅ Deployment complete
   ```

### Analyser les Erreurs

Si vous voyez une erreur:

```
❌ Error: FAZER_API_KEY is required in production
```

**Solution:**
1. Allez dans Render → Web Service → Environment
2. Vérifiez que FAZER_API_KEY est bien ajoutée comme Secret
3. Cliquez "Manual Deploy"

---

## 🔄 Mise à Jour du Code

### Après un `git push` sur `main`

1. Render détecte automatiquement les changements
2. Lance un nouveau build
3. Redéploie les services (≈2-3 minutes)
4. Pas de downtime

### Pour redéployer manuellement

1. Render Dashboard → Service
2. Cliquez **"Manual Deploy"**
3. Render redéploie immédiatement

---

## 🆘 Troubleshooting

### Problème: Build échoue - "unknown type 'static_site'"

**Cause**: Render Blueprint n'accepte pas `static_site` en v1

**Solution**:
- Frontend = Static Site manuel (pas dans Blueprint)
- Backend = Web Service dans Blueprint ✅

### Problème: FAZER_API_KEY absent à la production

```
❌ Error: FAZER_API_KEY is required in production
```

**Solution**:
1. Render Dashboard → Web Service → Environment
2. Ajouter Secret: `FAZER_API_KEY = [votre_clé]`
3. Manual Deploy

### Problème: Frontend ne peut pas joindre le backend (CORS)

```
❌ CORS error: blocked by CORS policy
```

**Solution**:
1. Vérifier `backend/src/server.ts` CORS origin:
   ```typescript
   cors({
     origin: FRONTEND_URL,  // doit être https://amical-pay-frontend.onrender.com
   })
   ```
2. Vérifier VITE_API_URL dans frontend: `https://amical-pay-api.onrender.com`
3. Redéployer les deux services

### Problème: Backend ne démarre pas

```
❌ Error: Cannot find module 'express'
```

**Solution**:
1. Vérifier `backend/package.json` existe
2. Vérifier Build Command: `cd backend && npm install && npm run build`
3. Vérifier Start Command: `cd backend && npm start`
4. Logs Render pour plus de détails

---

## 📈 Performance et Optimisation

### Pour le Backend

- Plan Starter = CPU 0.5, RAM 512MB (suffisant pour commencer)
- Pour production: Envisager Standard Plan (1 CPU, 2GB RAM)
- Utilisez Render Disk pour la persistence si nécessaire

### Pour le Frontend

- Static Site = Servi via CDN Render (très rapide)
- Cache: 1 jour par défaut (adapté pour les mises à jour quotidiennes)

---

## 📚 Ressources

- [Render Documentation](https://render.com/docs)
- [Render Blueprint Spec](https://render.com/docs/blueprint-spec)
- [FazerCards API](https://api.fzr.cards/public/docs)
- [Vite Documentation](https://vitejs.dev)
- [Express.js Documentation](https://expressjs.com)

---

## ✅ Checklist Final

```
✅ Backend déployé sur Render
✅ Frontend déployé sur Render
✅ FAZER_API_KEY configurée comme Secret
✅ ADMIN_TOKEN configurée comme Secret
✅ Health checks fonctionnent
✅ FazerCards connection test réussit
✅ Produits Free Fire LATAM chargés
✅ Validation Player ID fonctionne
✅ Frontend appelle correctement le backend
✅ CORS configuré correctement
✅ Aucune clé API exposée au frontend
✅ HTTPS activé sur les deux services
✅ Logs accessibles pour monitoring
```

---

**Dernière mise à jour**: 2024-09-13

**Status**: ✅ Production-ready
