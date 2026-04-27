# GymAI: Full User & Data Journey Explanation

When a person visits your application, they undergo a specific multi-step lifecycle spanning authentication, data entry, AI generation, and final plan delivery. Below is a deep dive into exactly how the components talk to each other to make this happen.

## Step-by-Step Technical Breakdown

### 1. Landing & Authentication
- **User Activity**: The user arrives at `Home.tsx`. If they are already logged in, the `AuthContext` safely redirects them to their dashboard (`/profile`). If not, they are presented with the hero section.
- **Under the Hood**: Clicking "Get Started" takes them to a protected view. The app detects they don't have a session, so the Neon Auth wrapper kicks in (`<RedirectToSignIn />`), rendering `Auth.tsx`.
- **Neon's Role**: Neon manages passwordless or standard auth and securely sets a session cookie. This populates `neonUser` inside your global `AuthContext.tsx`.

### 2. Onboarding Questionnaire (`Onboarding.tsx`)
- **User Activity**: The user fills out a 7-step form regarding their goals (Bulk/Cut), experience level, available equipment, and any injuries.
- **Under the Hood**:
  - The form is purely cosmetic React until they hit *"Generate My Plan"*.
  - When submitted, the `handleQuestionnaire` function in `Onboarding.tsx` calls `saveProfile()` from the context.
  - This executes `api.saveProfile(...)`, hitting `POST /api/profile` on the Express backend.
  - Express grabs the data and uses Prisma to elegantly push it to your Neon Postgres database, hitting the `user_profiles` schema.

### 3. The Core Logic: Generating the Plan
- **Under the Hood**: Immediately after `saveProfile()` finishes, the `Onboarding.tsx` component automatically triggers `generatePlan()` from your Context. This is where the magic happens.
  - A request flies to `POST /api/plan/generate` on your server.
  - The server queries your database to read the `user_profiles` information that was just submitted.
  - Your server takes those constraints (e.g., *Goal: Bulk, Split: Upper/Lower, Status: Advanced*) and injects them into the `buildPrompt` function inside `lib/ai.ts`.
  - The prompt explicitly instructs OpenRouter/LLaMA to return raw JSON and uses OpenAI's `{ type: "json_object" }` flag to force the LLM to adhere structurally to your required format.

### 4. Database Storage & Versioning
- **Under the Hood**: 
  - Once the LLM returns the parsed JSON payload, your `plan.ts` router checks the `training_plans` table to see if this user already has a plan.
  - If they do, it increments the `version` column recursively. If not, it sets it to Version 1.
  - It inserts the newly minted workout split into the `training_plans` table as JSON.

### 5. Final Display
- **Under the Hood**: 
  - The frontend `generatePlan` API call resolves successfully.
  - This prompts the `AuthContext` to call `refreshData()`, seamlessly fetching `GET /api/plan/current`.
  - The server asks the DB for the most recent `training_plan` record, sorted by `created_at desc`.
  - The React frontend receives the `plan` object, saves it in the global state, drops the "Generating AI..." loading spinner, and the UI shifts to display the user's bespoke 4-day Upper-Lower routine.
