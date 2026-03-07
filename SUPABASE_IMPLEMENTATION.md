# Supabase Implementation Guide

This guide provides a step-by-step explanation on how to set up and integrate Supabase into the Lead Options FX application.

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

## 6. Security Note

Always ensure that Row Level Security (RLS) is enabled on your tables and buckets to protect user data.
