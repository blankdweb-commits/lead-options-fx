# Supabase Implementation Guide

This guide provides a step-by-step explanation on how to set up and integrate Supabase into the Lead Options FX application.

## 🚀 CRITICAL: Deployment Checklist (Fixing Blank Pages)

If your site is blank on Vercel, follow this exactly:

1.  **Environment Variables:** You MUST add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Settings > Environment Variables.
    -   Ensure there are no leading or trailing spaces.
    -   Redeploy the site after adding variables.
2.  **Redeploy:** After adding variables, you MUST trigger a new deployment for them to take effect.
3.  **Vercel Configuration:** Ensure `vercel.json` is in your root directory.
4.  **Output Directory:** Vite builds to the `dist` folder. In Vercel Project Settings, ensure "Output Directory" is set to `dist` (this is handled automatically by the included `vercel.json`).
5.  **No index.css:** The project uses Tailwind CDN; ensure no code is trying to import a non-existent `index.css`.

## 1. Supabase Project Setup

1.  **Create a Project:** Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Get Credentials:** In your project settings, find the `API` section to get your `Project URL` and `anon` key.
3.  **Environment Variables:** Create a `.env` file in the root of your project (if not already present) and add the following:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

## 2. Authentication (JWT System)

Supabase handles authentication using JWTs automatically.

1.  **Enable Email Provider:** In the Supabase Dashboard, go to `Authentication` > `Providers` and ensure `Email` is enabled.
2.  **Redirect URLs:** In `Authentication` > `URL Configuration`, add your application's URL (e.g., `http://localhost:5173`) to the `Redirect URLs`.
3.  **JWT Configuration:** You can customize the JWT expiry and other settings in `Authentication` > `Settings`.

## 3. Storage (Buckets)

The application uses Supabase Storage for profile images.

1.  **Create a Bucket:** Go to `Storage` in the Supabase Dashboard and create a new bucket named `profiles`.
2.  **Public Access:** Make the `profiles` bucket public so that profile images can be accessed via a public URL.
3.  **Policies (RLS):** Set up policies to allow users to upload their own avatars.
    -   **Select Policy:** Allow public access to read.
    -   **Insert/Update Policy:** Allow authenticated users to upload to `avatars/` folder.

## 4. Database (Optional but Recommended)

While the current app uses some mock data, you can migrate it to Supabase tables:

1.  **Users Table:** Create a `profiles` table that links to `auth.users`.
2.  **Transactions Table:** Create a `transactions` table to store deposit and withdrawal history.
3.  **System Settings:** Store global settings like wallet addresses and fees in a `settings` table.

## 5. Integration Details

### Authentication
The app uses `supabase.auth.signInWithPassword` and `supabase.auth.signUp` in `Login.tsx` and `Signup.tsx`. The session is managed in `App.tsx` using `supabase.auth.onAuthStateChange`.

### Storage
Profile image uploads are handled in `Profile.tsx` using:
```typescript
const { data, error } = await supabase.storage
  .from('profiles')
  .upload(`avatars/${fileName}`, file);
```
And retrieval via:
```typescript
const { data: { publicUrl } } = supabase.storage
  .from('profiles')
  .getPublicUrl(filePath);
```

## 6. Vercel Integration

### SPA Routing
To ensure that all frontend routes are handled correctly by the React application on Vercel, a `vercel.json` file has been added with the following rewrite rule:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment Variables on Vercel (CRITICAL)
1.  Go to your project on the Vercel Dashboard.
2.  Navigate to `Settings` > `Environment Variables`.
3.  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with their respective values.
4.  **CRITICAL:** The app will show a blank page or throw initialization errors if these are missing. Ensure they are correctly spelled and have no leading/trailing spaces.
5.  Redeploy the application for the changes to take effect.

### Using Supabase in Vercel Backend (Serverless Functions)
If you decide to add server-side logic via Vercel Functions:
1.  **Dependencies:** Ensure `@supabase/supabase-js` is in your `package.json`.
2.  **Initialization:** Use the same environment variables (without `VITE_` prefix if not using Vite's auto-exposure) to initialize the client.
3.  **Service Role Key:** For backend operations that need to bypass RLS, use the `service_role` key (keep this strictly in Vercel Environment Variables and NEVER expose it to the frontend).

## 7. Supabase Storage Policies for Production

For the `profiles` bucket to work correctly in production:

1.  **Bucket Name:** Ensure the bucket name is exactly `profiles`.
2.  **Public Access:** The bucket should be set to "Public".
3.  **RLS Policies:**
    -   **Read Access:** `true` (Allow everyone to read).
    -   **Upload Access:** `auth.uid() = owner` or similar logic to allow authenticated users to upload to their folder.
    -   **Update/Delete Access:** Restricted to the owner of the file.

## 8. Troubleshooting Blank Page

If you encounter a blank page on Vercel:
1.  **Check Console Logs:** Look for errors related to failed module loading or missing environment variables.
2.  **Verify Vite Config:** Ensure that `base: '/'` is set or default, and that `build.outDir` matches Vercel's expectations (usually `dist`).
3.  **Dependency Resolution:** If using `importmap`, it may conflict with Vite's build process. It is recommended to let Vite manage all dependencies.

## 9. Security Note

Always ensure that Row Level Security (RLS) is enabled on your tables and buckets to protect user data.
