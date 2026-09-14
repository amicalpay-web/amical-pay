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

## Secrets obligatoires

À renseigner dans Render pour amical-pay-api :

- FAZER_API_KEY
- ADMIN_TOKEN

Ces valeurs ne doivent jamais être ajoutées à GitHub.

## Vérification après déploiement

1. Ouvrir https://amical-pay-api.onrender.com/healthz et vérifier une réponse JSON avec status: ok.
2. Ouvrir https://amical-pay-frontend.onrender.com.
3. Tester l’affichage des produits et la création d’une commande.
4. Si l’API répond par une erreur CORS, vérifier que FRONTEND_URL correspond exactement à l’URL publique du frontend.

## Important

Le fichier local .env.local ne doit pas être versionné. Le .gitignore racine l’exclut pour les prochains commits ; il reste à retirer du dépôt séparément.
