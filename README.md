# 📸 Family Album & Memory Hub

A secure, private, and collaborative space for families to preserve, organize, and relive their most cherished memories. Built with **Next.js 15**, **Prisma**, **PostgreSQL**, **Cloudinary**, and **Auth.js (NextAuth v5)**.

---

## ✨ Features

- **🔒 Private & Secure Auth**: Google Sign-In with strict invite-only restrictions. The first registered user automatically becomes the `ADMIN`.
- **👥 Role-Based Access Control**:
  - `ADMIN`: Full control over invite codes, albums, and media management.
  - `MEMBER`: Can upload media, write comments, add reactions, and create albums.
  - `GUEST`: Read-only access to view the timeline and albums.
- **📸 Smart Media Timeline**: An endless-scroll feed showing photo and video memories, with support for:
  - Text search by caption or uploader.
  - Interactive comments and custom emoji reactions.
  - Exif metadata and automatic AI tagging.
- **🏷️ Intelligent Auto-Tagging (Smart Collections)**: Automatically groups family memories into collections based on AI-generated tags returned by Cloudinary (e.g. "nature", "birthday", "childhood").
- **📁 Manual Collections**: Group specific memories together inside custom named albums with designated cover photos.
- **🚀 Advanced Media Handling**: Uploading and hosting powered by Cloudinary with automatic resizing, transcoding, and thumbnail generation.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Database & ORM**: [Prisma](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/) (Neon Serverless)
- **Authentication**: [Auth.js / NextAuth.js v5](https://authjs.dev/) with Google OAuth Provider
- **Storage & Processing**: [Cloudinary](https://cloudinary.com/) (using `next-cloudinary` widget)
- **Styling & UI**: Tailwind CSS, Outfit & Inter fonts, Lucide React icons

---

## 📂 Project Structure

```text
├── prisma/
│   └── schema.prisma        # Database schema models (User, Media, Album, Comments, etc.)
├── src/
│   ├── app/
│   │   ├── api/             # API Route Handlers (media, comments, reactions, albums)
│   │   ├── albums/          # Album browser and dynamic album detail pages
│   │   ├── timeline/        # Main memory stream feed
│   │   ├── upload/          # Media upload interface with Cloudinary
│   │   ├── login/           # Authentication page
│   │   ├── globals.css      # Core styles & Tailwind directives
│   │   └── layout.tsx       # Root layout (provides session context, theme classes)
│   ├── components/          # Reusable UI components
│   │   ├── CommentSection.tsx # Media detail comment section
│   │   ├── Lightbox.tsx     # Fullscreen photo/video viewer
│   │   ├── MediaCard.tsx    # Interactive thumbnail card for grid views
│   │   ├── Navbar.tsx       # Main header navigation with user profile menu
│   │   ├── ReactionBar.tsx  # Quick emoji reaction bar
│   │   ├── Timeline.tsx     # Infinite scroll feed container
│   │   └── UploadFAB.tsx    # Floating action button for quick uploads
│   ├── lib/
│   │   ├── cloudinary.ts    # Cloudinary configuration and signature helper
│   │   ├── prisma.ts        # Cached Prisma Client instance
│   │   └── utils.ts         # Utility functions (cn class merger)
│   ├── middleware.ts        # Next.js authentication & route protection middleware
│   └── auth.ts              # NextAuth configuration and lifecycle callbacks
```

---

## 🗄️ Database Architecture

The PostgreSQL database contains the following relational models:

- **`User`**: Profiles for registered users including name, email, avatar image, and system role (`ADMIN`, `MEMBER`, `GUEST`).
- **`Media`**: Uploaded photos and videos containing paths, AI-tags, EXIF coordinates, and references to the uploader.
- **`Album`**: Collection metadata (is it a manual album or a smart tag collection?).
- **`AlbumMedia`**: Many-to-many join model linking `Media` items to their respective `Album` containers.
- **`Comment`**: Threaded conversations associated with media items.
- **`Reaction`**: Emojis applied to media records by different family members.
- **`Invite`**: Invitation codes that grant access and assign specific roles to new signups.

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18.x or higher) and a PostgreSQL database (like Neon) ready.

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# Auth.js / NextAuth
AUTH_SECRET="your-32-character-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_TRUST_HOST="true"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-unsigned-upload-preset"
```

> [!TIP]
> Ensure that your Cloudinary upload preset is configured for **unsigned uploads** to support client-side uploads via the `CldUploadWidget`.

### 3. Install Dependencies

```bash
npm install
```

### 4. Push Database Schema

Create tables and sync the Prisma schema with your database instance:

```bash
npx prisma db push
```

### 5. Launch Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) inside your browser.

---

## 🛠️ Hydration Note

Some browser security extensions (like *Bitdefender*) may inject tracker and registry properties directly into the HTML body at load time. To prevent React hydration mismatches on client mounts:
- Both `<html>` and `<body>` tags in [layout.tsx](file:///d:/projects/test-app/album/src/app/layout.tsx) are configured with `suppressHydrationWarning`.
