# KrushiMitra Free Hosting and Mobile Access

This project can be opened on a phone for free. Use the web link for browser/mobile testing and Capacitor only when a native Android APK is required.

## 1. Free cloud setup

Use a PostgreSQL provider for the database, a web service for Spring Boot, and Netlify for Angular.

Recommended starter stack:

- Frontend: Netlify free tier
- Backend: Render free tier
- Database: Neon free PostgreSQL tier
- Android web wrapper: Capacitor, optional

Free plans can sleep when idle and can limit monthly usage. They are suitable for a demo, not guaranteed production capacity.

## 2. Create the PostgreSQL database

Create a PostgreSQL database in Neon or another provider. Record:

- JDBC URL, for example `jdbc:postgresql://host:5432/database?sslmode=require`
- Database username
- Database password

Set these as Spring environment variables. Flyway will create or update the schema automatically on backend startup.

Required backend environment variables:

```text
DB_URL=jdbc:postgresql://HOST:5432/DATABASE?sslmode=require
DB_USERNAME=DATABASE_USERNAME
DB_PASSWORD=DATABASE_PASSWORD
JWT_SECRET=A_LONG_RANDOM_SECRET_WITH_MORE_THAN_32_CHARACTERS
APP_ALLOWED_ORIGINS=https://YOUR-SITE.netlify.app,capacitor://localhost,http://localhost
```

Do not use the H2 test profile in production.

## 3. Deploy Spring Boot

Use the backend Dockerfile:

```text
backend/Dockerfile
```

On Render:

1. Create a Web Service.
2. Connect this repository or upload it to GitHub.
3. Set the Root Directory to `backend`.
4. Choose Docker as the runtime.
5. Add the five environment variables above.
6. Deploy and copy the generated HTTPS URL, such as `https://krushimitra-api.onrender.com`.

The health endpoint is not an application health endpoint yet. The backend can be checked at `/api/auth/login` or `/api/auth/me`.

## 4. Configure the hosted frontend API

Edit `frontend/public/runtime-config.js` and replace the placeholder:

```js
window.KRUSHIMITRA_CONFIG = {
  apiUrl: 'https://krushimitra-api.onrender.com'
};
```

This file is copied with the Angular build, so Netlify requires no Angular rebuild for API-host edits. Rebuild after adding a changed hosted URL only if the file is modified during the build, but the runtime file can be deployed directly with the dist assets.

## 5. Deploy Angular to Netlify

From the repository root:

```powershell
cd frontend
npm install
npm run build
```

Deploy using either Netlify Drop or Git integration.

Netlify Drop:

1. Open Netlify.
2. Choose **Add new project** or **Deploy manually**.
3. Upload `frontend/dist/frontend/browser`.
4. Copy the Netlify HTTPS URL.

Netlify Git deployment:

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist/frontend/browser`

The included `netlify.toml` configures this automatically for Git deployment.

## 6. Open on a mobile phone

Open the Netlify HTTPS URL in Chrome on Android or Safari on iPhone. This is the simplest mobile web test.

For a phone on the same Wi-Fi, run:

```powershell
cd frontend
npm start -- --host 0.0.0.0 --port 4310
```

Find the PC IPv4 address:

```powershell
ipconfig
```

Open on the phone:

```text
http://PC-IP:4310
```

Allow Node and Spring ports through Windows Firewall. This LAN method only works when both devices share the same network.

## 7. Android Capacitor use

Build a native app after the hosted API URL is configured:

```powershell
cd frontend
npm run android:build
npm run android:open
```

Android Studio can create an APK or run the app on a connected phone or emulator. Android devices require an actual Android SDK and valid SDK path.

For network calls from Android, use HTTPS. Android cleartext HTTP is only for local development.

## 8. Smartphone permissions

When the app first uses these features, the browser or Android system will request:

- Microphone
- Camera or photo-library access
- Location only if added later

Speech recognition and speech synthesis are browser/device dependent. A Gujarati voice may not exist on every Android phone.

## 9. Minimum verification

Before sharing the hosted URL:

1. Register a farmer.
2. Log in in Gujarati, Hindi, and English.
3. Refresh the browser and verify language persists.
4. Open the assistant from the home page.
5. Ask a text question.
6. Test image upload with JPG/PNG.
7. Test conversation history.
8. Open the hosted URL on mobile.
9. Verify logout and login again.

Do not claim disease diagnosis or live weather/market functionality unless the related provider is implemented and tested.
