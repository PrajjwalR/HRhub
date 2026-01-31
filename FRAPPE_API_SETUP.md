# How to Get Your Frappe API Credentials

Follow these simple steps to get your API credentials from Frappe:

## Step 1: Open Frappe in Your Browser
Go to: `http://localhost:8000`

## Step 2: Login
Login with your administrator credentials (the ones you created when setting up Frappe)

## Step 3: Go to Your User Profile
1. Click on your profile picture/name in the top right corner
2. Click on "My Settings" or search for "User" in the search bar
3. Open your user document (usually "Administrator")

## Step 4: Generate API Keys
1. Scroll down to the **"API Access"** section
2. Click the **"Generate Keys"** button
3. You'll see two values appear:
   - **API Key** (a long string)
   - **API Secret** (another long string)

## Step 5: Copy the Keys
1. Copy the **API Key**
2. Copy the **API Secret**
3. Open the file `.env.local` in your HRhub project
4. Replace `your_api_key_here` with your actual API Key
5. Replace `your_api_secret_here` with your actual API Secret

## Step 6: Restart Your Next.js Server
1. Stop the `npm run dev` command (Ctrl+C)
2. Start it again: `npm run dev`
3. Refresh your browser at `http://localhost:3000`

The employee data should now load successfully! 🎉
