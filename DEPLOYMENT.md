# Déploiement Amical Pay sur Render

Le dépôt contient deux services Render définis dans render.yaml :

- amical-pay-api : API Node/Express située dans backend/
- amical-pay-frontend : application React/Vite située à la racine

## Configuration Render

Le Blueprint utilise automatiquement :

- API : npm install && npm run build, puis npm start
- Frontend : npm install && npm run build, puis Vite Preview sur 0.0.0.0:$PORT
- API health check : /healthz
- Déploiement automatique à chaque commit sur main

## Clés et variables d’environnement

Pour amical-pay-api :

- FAZER_API_KEY : seule clé à fournir manuellement ; elle vient de FazerCards.
- ADMIN_TOKEN : ne vient pas de FazerCards. Render le génère automatiquement via generateValue dans render.yaml pour protéger les routes /api/admin/*.
- FRONTEND_URL : URL publique du frontend, déjà définie dans le Blueprint.

Ne mets aucune clé secrète dans GitHub. Ne remplace pas ADMIN_TOKEN par la clé FazerCards.

## Vérification après déploiement

1. Ouvrir https://amical-pay-api.onrender.com/healthz et vérifier une réponse JSON avec status: ok.
2. Ouvrir https://amical-pay-frontend.onrender.com.
3. Tester l’affichage des produits et la création d’une commande.
4. Si l’API répond par une erreur CORS, vérifier que FRONTEND_URL correspond exactement à l’URL publique du frontend.
5. Pour utiliser les routes admin, envoyer le token généré par Render comme Bearer token.

## Important

Le fichier local .env.local ne doit pas être versionné. Le .gitignore racine l’exclut et le fichier déjà suivi a été retiré du dépôt.
