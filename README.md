# EdTech Editor Application

A modern, local-first inspired collaborative document editor built with Next.js, Supabase, and TipTap.

## ✨ Features

- **Secure Authentication**: Full login and signup flows powered by Supabase Auth with custom email enumeration protection.
- **Rich Text Editing**: A robust, Word-like editing experience powered by TipTap. Features include a static top toolbar, Headings (H1-H6), Bold, Italic, Strikethrough, Lists, Blockquotes, Text Colors, and Highlighting.
- **Auto-Saving**: Never lose your work. Changes are automatically synced to the database as you type.
- **Smart Auto-Titles**: Start typing in a new "Unknown" document, and the app will automatically generate a title based on your first few words seamlessly in the background.
- **Version History System**: Every time you finish editing and leave a document, a discrete snapshot is saved. You can open the "History" sidebar to preview past versions and instantly restore them.
- **Medium Light Mode UI**: A premium, custom-designed aesthetic featuring a warm cream background (`#FFF0E4`), deep teal typography (`#007979`), bright teal accents (`#24B1B1`), and modern glassmorphic frosted-glass components.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)
- **Editor Engine**: [TipTap](https://tiptap.dev/) (Headless ProseMirror framework)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/typography`
- **Icons**: [Lucide React](https://lucide.dev/)

## ⚙️ How It Works

### 1. Document Management
When a user logs in, they see a personalized Dashboard fetching all their documents from the Supabase `documents` table. Clicking "New Document" triggers a Server Action that inserts a blank row with the title "Unknown" and redirects the user to the `document/[id]` page.

### 2. The TipTap Editor (`TipTapEditor.tsx`)
The core editor hooks into TipTap's `useEditor` and utilizes several extensions (`StarterKit`, `Color`, `TextStyle`, `Highlight`). 
- **Auto-save**: The `onUpdate` hook triggers every time the document changes. It grabs the JSON content and securely pushes it to Supabase.
- **Auto-Title**: If the document title is "Unknown", the `onUpdate` hook extracts the raw text of the first block and updates the database with a 4-word auto-generated title.
- **Data Rescue**: If the editor detects a document saved in the old `Editor.js` format, it automatically intercepts it and converts the legacy blocks into HTML so data is never lost.

### 3. Version History & Reliable Snapshots
The versioning system works silently in the background:
- **Tracking**: An internal flag (`hasUnsavedEdits`) flips to true when you type.
- **Session End Detection**: A React `useEffect` cleanup function and a window `beforeunload` event listener detect when you navigate away or close the browser tab.
- **Keepalive Fetch**: To ensure the snapshot saves even if the browser tab is immediately destroyed, it sends the payload to `api/documents/[id]/version` using a native fetch request with the `keepalive: true` browser flag.
- **UI Restoration**: Opening the Version History sidebar fetches rows from `document_versions`. Clicking "Preview" sets the editor to `readOnly` mode. Clicking "Restore" forces the React component to remount (by updating its `key` prop), completely resetting the editor state with the historical JSON data.

## 🚀 Getting Started

1. Set up your Supabase project and apply the SQL schemas from `schema.sql`.
2. Add your Supabase URL and Anon Key to your `.env.local` file.
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
