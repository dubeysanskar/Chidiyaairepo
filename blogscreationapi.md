# 📦 Blog CMS — Complete Reusable Code Reference (Generic)

> **Stack**: Next.js 15+ (App Router) + SQLite OR PostgreSQL + File Upload
> **Features**: Admin Panel, Bilingual (any 2 languages), Carousel, Video, Full SEO, JSON-LD
> **Auth**: Simple admin key via env var — no external auth provider needed
> **Database**: Choose between local SQLite or cloud PostgreSQL (Supabase/Neon/etc.)

---

## Table of Contents

1. [Environment Variables (.env.local)](#1-environment-variables)
2. [Package Dependencies](#2-package-dependencies)
3. [Next.js Config](#3-nextjs-config)
4. [Database Layer — OPTION A: SQLite](#4a-database-layer--sqlite)
5. [Database Layer — OPTION B: PostgreSQL](#4b-database-layer--postgresql)
6. [API: Blog List & Create — src/app/api/blog/route.js](#5-api-blog-list--create)
7. [API: Blog CRUD — src/app/api/blog/[id]/route.js](#6-api-blog-crud)
8. [API: File Upload — src/app/api/upload/route.js](#7-api-file-upload)
9. [Admin Layout — src/app/admin/layout.jsx](#8-admin-layout)
10. [Admin Panel — src/app/admin/page.jsx](#9-admin-panel)
11. [Blog Listing Page — src/app/blog/page.jsx](#10-blog-listing-page)
12. [Blog Listing Client — src/app/blog/BlogClient.jsx](#11-blog-listing-client)
13. [Blog Detail Page — src/app/blog/[slug]/page.jsx](#12-blog-detail-page)
14. [Blog Detail Client — src/app/blog/[slug]/BlogDetailClient.jsx](#13-blog-detail-client)
15. [.gitignore additions](#14-gitignore-additions)
16. [Deployment Notes](#15-deployment-notes)
17. [Customization Guide](#16-customization-guide)

---

## 1. Environment Variables

**File**: `.env.local`

```env
# ============================================================
# BLOG CMS ENVIRONMENT VARIABLES
# ============================================================

# ---------- AUTH ----------
# Admin authentication key — used as password for /admin login
ADMIN_SECRET=your_strong_password_here

# ---------- SITE ----------
# Site URL — used for canonical URLs, OG tags, JSON-LD
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Site name — displayed in meta tags and JSON-LD
NEXT_PUBLIC_SITE_NAME=Your Brand Name

# ---------- DATABASE (choose one) ----------

# OPTION A: SQLite (no extra env needed, uses local file)
# DB file will be created at: ./data/blog.db
DB_TYPE=sqlite

# OPTION B: PostgreSQL (Supabase, Neon, Railway, etc.)
# DB_TYPE=postgres
# DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
# Example Supabase: postgresql://postgres.xxxx:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
# Example Neon: postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# ---------- OPTIONAL ----------
# SMTP for contact form (not blog-specific)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=465
# SMTP_USER=your@email.com
# SMTP_PASS=app_password
```

---

## 2. Package Dependencies

```bash
# OPTION A: SQLite
npm install better-sqlite3

# OPTION B: PostgreSQL
npm install pg

# OPTION C: Both (if you want to switch between them)
npm install better-sqlite3 pg
```

---

## 3. Next.js Config

**File**: `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // REQUIRED for SQLite: better-sqlite3 is a native module
  // Also add 'pg' if using PostgreSQL
  serverExternalPackages: ['better-sqlite3', 'pg'],
};

export default nextConfig;
```

---

## 4a. Database Layer — SQLite

**File**: `src/lib/db.js` (when using `DB_TYPE=sqlite`)

```js
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'blog.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        title_secondary TEXT,
        excerpt TEXT,
        excerpt_secondary TEXT,
        content TEXT NOT NULL,
        content_secondary TEXT,
        category TEXT,
        post_type TEXT DEFAULT 'normal' CHECK(post_type IN ('normal','carousel','video')),
        published INTEGER DEFAULT 0,
        cover_image TEXT,
        meta_title TEXT,
        meta_description TEXT,
        meta_keywords TEXT,
        meta_title_secondary TEXT,
        meta_description_secondary TEXT,
        meta_keywords_secondary TEXT,
        canonical_url TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blog_media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blog_id INTEGER NOT NULL,
        media_url TEXT NOT NULL,
        media_type TEXT DEFAULT 'image' CHECK(media_type IN ('image','video')),
        sort_order INTEGER DEFAULT 0,
        alt_text TEXT,
        alt_text_secondary TEXT,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
    );
`);

// ═══════════════════════════════════════════════════════
// QUERY HELPERS — SQLite versions
// ═══════════════════════════════════════════════════════

export function getAllBlogs(publishedOnly = false) {
    const rows = publishedOnly
        ? db.prepare('SELECT * FROM blogs WHERE published = 1 ORDER BY created_at DESC').all()
        : db.prepare('SELECT * FROM blogs ORDER BY created_at DESC').all();
    return rows.map(row => {
        const blog = mapBlog(row);
        blog.media = db.prepare('SELECT * FROM blog_media WHERE blog_id = ? ORDER BY sort_order ASC').all(row.id).map(mapMedia);
        return blog;
    });
}

export function getBlogByIdOrSlug(idOrSlug) {
    const isNumeric = /^\d+$/.test(idOrSlug);
    const row = isNumeric
        ? db.prepare('SELECT * FROM blogs WHERE id = ?').get(parseInt(idOrSlug))
        : db.prepare('SELECT * FROM blogs WHERE slug = ?').get(idOrSlug);
    if (!row) return null;
    const blog = mapBlog(row);
    blog.media = db.prepare('SELECT * FROM blog_media WHERE blog_id = ? ORDER BY sort_order ASC').all(row.id).map(mapMedia);
    return blog;
}

export function getBlogBySlugPublished(slug) {
    const row = db.prepare('SELECT * FROM blogs WHERE slug = ? AND published = 1').get(slug);
    if (!row) return null;
    const blog = mapBlog(row);
    blog.media = db.prepare('SELECT * FROM blog_media WHERE blog_id = ? ORDER BY sort_order ASC').all(row.id).map(mapMedia);
    return blog;
}

export function createBlog(body) {
    const existing = db.prepare('SELECT id FROM blogs WHERE slug = ?').get(body.slug);
    if (existing) return { error: 'A blog with this slug already exists' };

    const result = db.prepare(`
        INSERT INTO blogs (slug, title, title_secondary, excerpt, excerpt_secondary, content, content_secondary, category, post_type, cover_image, published, meta_title, meta_description, meta_keywords, meta_title_secondary, meta_description_secondary, meta_keywords_secondary, canonical_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        body.slug, body.title, body.titleSecondary || null,
        body.excerpt || null, body.excerptSecondary || null,
        body.content, body.contentSecondary || null,
        body.category || null, body.postType || 'normal',
        body.coverImage || null, body.published ? 1 : 0,
        body.metaTitle || null, body.metaDescription || null, body.metaKeywords || null,
        body.metaTitleSecondary || null, body.metaDescriptionSecondary || null, body.metaKeywordsSecondary || null,
        body.canonicalUrl || null,
    );

    const blogId = result.lastInsertRowid;
    insertMedia(blogId, body.media);
    return getBlogByIdOrSlug(String(blogId));
}

export function updateBlog(id, body) {
    const blogId = parseInt(id);
    const fields = [];
    const values = [];

    const fieldMap = {
        title: 'title', titleSecondary: 'title_secondary', slug: 'slug',
        excerpt: 'excerpt', excerptSecondary: 'excerpt_secondary',
        content: 'content', contentSecondary: 'content_secondary',
        category: 'category', postType: 'post_type', coverImage: 'cover_image',
        metaTitle: 'meta_title', metaDescription: 'meta_description', metaKeywords: 'meta_keywords',
        metaTitleSecondary: 'meta_title_secondary', metaDescriptionSecondary: 'meta_description_secondary',
        metaKeywordsSecondary: 'meta_keywords_secondary', canonicalUrl: 'canonical_url',
    };

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
        if (body[jsKey] !== undefined) { fields.push(`${dbKey} = ?`); values.push(body[jsKey]); }
    }
    if (body.published !== undefined) { fields.push('published = ?'); values.push(body.published ? 1 : 0); }
    if (fields.length === 0 && body.media === undefined) return getBlogByIdOrSlug(String(blogId));

    if (fields.length > 0) {
        fields.push("updated_at = datetime('now')");
        values.push(blogId);
        db.prepare(`UPDATE blogs SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    if (body.media !== undefined) {
        db.prepare('DELETE FROM blog_media WHERE blog_id = ?').run(blogId);
        insertMedia(blogId, body.media);
    }

    return getBlogByIdOrSlug(String(blogId));
}

export function deleteBlog(id) {
    db.prepare('DELETE FROM blogs WHERE id = ?').run(parseInt(id));
}

function insertMedia(blogId, media) {
    if (!media || media.length === 0) return;
    const stmt = db.prepare('INSERT INTO blog_media (blog_id, media_url, media_type, sort_order, alt_text, alt_text_secondary) VALUES (?, ?, ?, ?, ?, ?)');
    for (const m of media) {
        stmt.run(blogId, m.mediaUrl, m.mediaType || 'image', m.sortOrder || 0, m.altText || null, m.altTextSecondary || null);
    }
}

// ═══════════════════════════════════════════════════════
// ROW MAPPERS (snake_case → camelCase)
// ═══════════════════════════════════════════════════════

export function mapBlog(row) {
    if (!row) return null;
    return {
        id: row.id, slug: row.slug,
        title: row.title, titleSecondary: row.title_secondary,
        excerpt: row.excerpt, excerptSecondary: row.excerpt_secondary,
        content: row.content, contentSecondary: row.content_secondary,
        category: row.category, postType: row.post_type,
        published: !!row.published, coverImage: row.cover_image,
        metaTitle: row.meta_title, metaDescription: row.meta_description, metaKeywords: row.meta_keywords,
        metaTitleSecondary: row.meta_title_secondary, metaDescriptionSecondary: row.meta_description_secondary,
        metaKeywordsSecondary: row.meta_keywords_secondary,
        canonicalUrl: row.canonical_url,
        createdAt: row.created_at, updatedAt: row.updated_at,
    };
}

export function mapMedia(row) {
    if (!row) return null;
    return {
        id: row.id, blogId: row.blog_id,
        mediaUrl: row.media_url, mediaType: row.media_type,
        sortOrder: row.sort_order, altText: row.alt_text, altTextSecondary: row.alt_text_secondary,
    };
}

export default db;
```

---

## 4b. Database Layer — PostgreSQL

**File**: `src/lib/db.js` (when using `DB_TYPE=postgres`)

```js
import pg from 'pg';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
    max: 10,
});

// ═══════════════════════════════════════════════════════
// INIT — Run once on first import (creates tables if missing)
// ═══════════════════════════════════════════════════════

let initialized = false;

async function initDB() {
    if (initialized) return;
    initialized = true;

    await pool.query(`
        CREATE TABLE IF NOT EXISTS blogs (
            id SERIAL PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            title_secondary TEXT,
            excerpt TEXT,
            excerpt_secondary TEXT,
            content TEXT NOT NULL,
            content_secondary TEXT,
            category TEXT,
            post_type TEXT DEFAULT 'normal' CHECK(post_type IN ('normal','carousel','video')),
            published BOOLEAN DEFAULT false,
            cover_image TEXT,
            meta_title TEXT,
            meta_description TEXT,
            meta_keywords TEXT,
            meta_title_secondary TEXT,
            meta_description_secondary TEXT,
            meta_keywords_secondary TEXT,
            canonical_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS blog_media (
            id SERIAL PRIMARY KEY,
            blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
            media_url TEXT NOT NULL,
            media_type TEXT DEFAULT 'image' CHECK(media_type IN ('image','video')),
            sort_order INTEGER DEFAULT 0,
            alt_text TEXT,
            alt_text_secondary TEXT
        );
    `);
}

// ═══════════════════════════════════════════════════════
// QUERY HELPERS — PostgreSQL versions
// ═══════════════════════════════════════════════════════

export async function getAllBlogs(publishedOnly = false) {
    await initDB();
    const query = publishedOnly
        ? 'SELECT * FROM blogs WHERE published = true ORDER BY created_at DESC'
        : 'SELECT * FROM blogs ORDER BY created_at DESC';
    const { rows } = await pool.query(query);

    const blogs = [];
    for (const row of rows) {
        const blog = mapBlog(row);
        const mediaResult = await pool.query('SELECT * FROM blog_media WHERE blog_id = $1 ORDER BY sort_order ASC', [row.id]);
        blog.media = mediaResult.rows.map(mapMedia);
        blogs.push(blog);
    }
    return blogs;
}

export async function getBlogByIdOrSlug(idOrSlug) {
    await initDB();
    const isNumeric = /^\d+$/.test(idOrSlug);
    const { rows } = isNumeric
        ? await pool.query('SELECT * FROM blogs WHERE id = $1', [parseInt(idOrSlug)])
        : await pool.query('SELECT * FROM blogs WHERE slug = $1', [idOrSlug]);

    if (rows.length === 0) return null;
    const blog = mapBlog(rows[0]);
    const mediaResult = await pool.query('SELECT * FROM blog_media WHERE blog_id = $1 ORDER BY sort_order ASC', [rows[0].id]);
    blog.media = mediaResult.rows.map(mapMedia);
    return blog;
}

export async function getBlogBySlugPublished(slug) {
    await initDB();
    const { rows } = await pool.query('SELECT * FROM blogs WHERE slug = $1 AND published = true', [slug]);
    if (rows.length === 0) return null;
    const blog = mapBlog(rows[0]);
    const mediaResult = await pool.query('SELECT * FROM blog_media WHERE blog_id = $1 ORDER BY sort_order ASC', [rows[0].id]);
    blog.media = mediaResult.rows.map(mapMedia);
    return blog;
}

export async function createBlog(body) {
    await initDB();
    const existing = await pool.query('SELECT id FROM blogs WHERE slug = $1', [body.slug]);
    if (existing.rows.length > 0) return { error: 'A blog with this slug already exists' };

    const { rows } = await pool.query(`
        INSERT INTO blogs (slug, title, title_secondary, excerpt, excerpt_secondary, content, content_secondary, category, post_type, cover_image, published, meta_title, meta_description, meta_keywords, meta_title_secondary, meta_description_secondary, meta_keywords_secondary, canonical_url)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        RETURNING id
    `, [
        body.slug, body.title, body.titleSecondary || null,
        body.excerpt || null, body.excerptSecondary || null,
        body.content, body.contentSecondary || null,
        body.category || null, body.postType || 'normal',
        body.coverImage || null, body.published || false,
        body.metaTitle || null, body.metaDescription || null, body.metaKeywords || null,
        body.metaTitleSecondary || null, body.metaDescriptionSecondary || null, body.metaKeywordsSecondary || null,
        body.canonicalUrl || null,
    ]);

    const blogId = rows[0].id;
    await insertMedia(blogId, body.media);
    return await getBlogByIdOrSlug(String(blogId));
}

export async function updateBlog(id, body) {
    await initDB();
    const blogId = parseInt(id);
    const sets = [];
    const vals = [];
    let idx = 1;

    const fieldMap = {
        title: 'title', titleSecondary: 'title_secondary', slug: 'slug',
        excerpt: 'excerpt', excerptSecondary: 'excerpt_secondary',
        content: 'content', contentSecondary: 'content_secondary',
        category: 'category', postType: 'post_type', coverImage: 'cover_image',
        metaTitle: 'meta_title', metaDescription: 'meta_description', metaKeywords: 'meta_keywords',
        metaTitleSecondary: 'meta_title_secondary', metaDescriptionSecondary: 'meta_description_secondary',
        metaKeywordsSecondary: 'meta_keywords_secondary', canonicalUrl: 'canonical_url',
    };

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
        if (body[jsKey] !== undefined) { sets.push(`${dbKey} = $${idx++}`); vals.push(body[jsKey]); }
    }
    if (body.published !== undefined) { sets.push(`published = $${idx++}`); vals.push(body.published); }

    if (sets.length > 0) {
        sets.push(`updated_at = NOW()`);
        vals.push(blogId);
        await pool.query(`UPDATE blogs SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
    }

    if (body.media !== undefined) {
        await pool.query('DELETE FROM blog_media WHERE blog_id = $1', [blogId]);
        await insertMedia(blogId, body.media);
    }

    return await getBlogByIdOrSlug(String(blogId));
}

export async function deleteBlog(id) {
    await initDB();
    await pool.query('DELETE FROM blogs WHERE id = $1', [parseInt(id)]);
}

async function insertMedia(blogId, media) {
    if (!media || media.length === 0) return;
    for (const m of media) {
        await pool.query(
            'INSERT INTO blog_media (blog_id, media_url, media_type, sort_order, alt_text, alt_text_secondary) VALUES ($1,$2,$3,$4,$5,$6)',
            [blogId, m.mediaUrl, m.mediaType || 'image', m.sortOrder || 0, m.altText || null, m.altTextSecondary || null]
        );
    }
}

// ═══════════════════════════════════════════════════════
// ROW MAPPERS (snake_case → camelCase)
// ═══════════════════════════════════════════════════════

export function mapBlog(row) {
    if (!row) return null;
    return {
        id: row.id, slug: row.slug,
        title: row.title, titleSecondary: row.title_secondary,
        excerpt: row.excerpt, excerptSecondary: row.excerpt_secondary,
        content: row.content, contentSecondary: row.content_secondary,
        category: row.category, postType: row.post_type,
        published: !!row.published, coverImage: row.cover_image,
        metaTitle: row.meta_title, metaDescription: row.meta_description, metaKeywords: row.meta_keywords,
        metaTitleSecondary: row.meta_title_secondary, metaDescriptionSecondary: row.meta_description_secondary,
        metaKeywordsSecondary: row.meta_keywords_secondary,
        canonicalUrl: row.canonical_url,
        createdAt: row.created_at, updatedAt: row.updated_at,
    };
}

export function mapMedia(row) {
    if (!row) return null;
    return {
        id: row.id, blogId: row.blog_id,
        mediaUrl: row.media_url, mediaType: row.media_type,
        sortOrder: row.sort_order, altText: row.alt_text, altTextSecondary: row.alt_text_secondary,
    };
}

export default pool;
```

---

## 5. API: Blog List & Create

**File**: `src/app/api/blog/route.js`

> **NOTE**: This API code works with BOTH SQLite and PostgreSQL. The database layer exports the same function names — SQLite uses sync calls, PostgreSQL uses async. The API always uses `await` which works for both.

```js
import { NextResponse } from 'next/server';
import { getAllBlogs, createBlog } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/blog — List all blogs
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const publishedOnly = searchParams.get('published') === 'true';
        const blogs = await getAllBlogs(publishedOnly);
        return NextResponse.json(blogs);
    } catch (error) {
        console.error('GET /api/blog error:', error);
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
}

// POST /api/blog — Create a new blog
export async function POST(request) {
    try {
        const adminKey = request.headers.get('x-admin-key');
        if (adminKey !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const result = await createBlog(body);

        if (result?.error) {
            return NextResponse.json({ error: result.error }, { status: 409 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('POST /api/blog error:', error);
        return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
    }
}
```

---

## 6. API: Blog CRUD

**File**: `src/app/api/blog/[id]/route.js`

```js
import { NextResponse } from 'next/server';
import { getBlogByIdOrSlug, updateBlog, deleteBlog } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/blog/[id] — Fetch single blog by ID or slug
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const blog = await getBlogByIdOrSlug(id);
        if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        return NextResponse.json(blog);
    } catch (error) {
        console.error('GET /api/blog/[id] error:', error);
        return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
    }
}

// PUT /api/blog/[id] — Update a blog
export async function PUT(request, { params }) {
    try {
        const adminKey = request.headers.get('x-admin-key');
        if (adminKey !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const blog = await updateBlog(id, body);
        if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        return NextResponse.json(blog);
    } catch (error) {
        console.error('PUT /api/blog/[id] error:', error);
        return NextResponse.json({ error: 'Failed to update blog', details: error?.message }, { status: 500 });
    }
}

// DELETE /api/blog/[id] — Delete a blog
export async function DELETE(request, { params }) {
    try {
        const adminKey = request.headers.get('x-admin-key');
        if (adminKey !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await deleteBlog(id);
        return NextResponse.json({ message: 'Blog deleted' });
    } catch (error) {
        console.error('DELETE /api/blog/[id] error:', error);
        return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
    }
}
```

---

## 7. API: File Upload

**File**: `src/app/api/upload/route.js`

```js
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const adminKey = request.headers.get('x-admin-key');
        if (adminKey !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const ext = path.extname(file.name);
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        await writeFile(filepath, buffer);

        // Determine media type
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

        return NextResponse.json({ url: `/uploads/${filename}`, mediaType });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
```

---

## 8. Admin Layout

**File**: `src/app/admin/layout.jsx`

```jsx
export const metadata = { title: 'Admin — Blog CMS' };
export default function AdminLayout({ children }) {
    return <>{children}</>;
}
```

---

## 9. Admin Panel

**File**: `src/app/admin/page.jsx`

```jsx
'use client';

import { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════
// CUSTOMIZE THESE VALUES FOR YOUR PROJECT
// ═══════════════════════════════════════════════════════
const ADMIN_ID = 'admin';                    // Change to your admin username
const BRAND_NAME = 'My Website';             // Your brand name
const BRAND_LOGO = 'MW';                     // 2-letter logo text
const BRAND_COLOR = '#2563eb';               // Primary brand color (hex)
const BRAND_COLOR_DARK = '#1d4ed8';          // Hover state color
const BRAND_GRADIENT = 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2563eb 100%)';
const PRIMARY_LANG = 'English';              // Primary language name
const PRIMARY_FLAG = '🇬🇧';                  // Primary language flag
const SECONDARY_LANG = 'Secondary';          // Secondary language name
const SECONDARY_FLAG = '🌐';                 // Secondary language flag
// ═══════════════════════════════════════════════════════

export default function AdminPage() {
    const [isAuth, setIsAuth] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [formData, setFormData] = useState({
        title: '', titleSecondary: '', slug: '', excerpt: '', excerptSecondary: '',
        content: '', contentSecondary: '', category: '', coverImage: '', published: false,
        postType: 'normal', metaTitle: '', metaDescription: '', metaKeywords: '',
        metaTitleSecondary: '', metaDescriptionSecondary: '', metaKeywordsSecondary: '', canonicalUrl: '',
    });
    const [mediaItems, setMediaItems] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [uploadMode, setUploadMode] = useState('url');
    const [uploading, setUploading] = useState(false);
    const [contentLang, setContentLang] = useState('primary');

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (email !== ADMIN_ID) { showMessage('Invalid admin ID', 'error'); return; }
        setAdminKey(password);
        setIsAuth(true);
    };

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/blog');
            if (res.ok) { setBlogs(await res.json()); }
            else { showMessage('Failed to fetch blogs', 'error'); }
        } catch { showMessage('Network error', 'error'); }
        setLoading(false);
    }, []);

    useEffect(() => { if (isAuth) fetchBlogs(); }, [isAuth, fetchBlogs]);

    const generateSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'title' && !editingBlog ? { slug: generateSlug(value) } : {}),
        }));
    };

    const handleFileUpload = async (e, isMedia = false) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            for (const file of files) {
                const fd = new FormData();
                fd.append('file', file);
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'x-admin-key': adminKey },
                    body: fd,
                });
                if (res.ok) {
                    const data = await res.json();
                    if (isMedia) {
                        setMediaItems(prev => [...prev, { mediaUrl: data.url, mediaType: data.mediaType, sortOrder: prev.length, altText: '', altTextSecondary: '' }]);
                    } else {
                        setFormData(prev => ({ ...prev, coverImage: data.url }));
                    }
                    showMessage('File uploaded!');
                } else { showMessage('Failed to upload', 'error'); }
            }
        } catch { showMessage('Upload error', 'error'); }
        setUploading(false);
    };

    const removeMedia = (idx) => setMediaItems(prev => prev.filter((_, i) => i !== idx));

    const resetForm = () => {
        setFormData({
            title: '', titleSecondary: '', slug: '', excerpt: '', excerptSecondary: '',
            content: '', contentSecondary: '', category: '', coverImage: '', published: false,
            postType: 'normal', metaTitle: '', metaDescription: '', metaKeywords: '',
            metaTitleSecondary: '', metaDescriptionSecondary: '', metaKeywordsSecondary: '', canonicalUrl: '',
        });
        setMediaItems([]);
        setEditingBlog(null);
        setShowForm(false);
        setUploadMode('url');
        setContentLang('primary');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = editingBlog ? `/api/blog/${editingBlog.id}` : '/api/blog';
            const method = editingBlog ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
                body: JSON.stringify({ ...formData, media: mediaItems }),
            });
            if (res.ok) {
                showMessage(editingBlog ? 'Blog updated!' : 'Blog created!');
                resetForm();
                fetchBlogs();
            } else {
                const err = await res.json();
                showMessage(err.error || 'Failed', 'error');
            }
        } catch { showMessage('Network error', 'error'); }
        setLoading(false);
    };

    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title, titleSecondary: blog.titleSecondary || '', slug: blog.slug,
            excerpt: blog.excerpt || '', excerptSecondary: blog.excerptSecondary || '',
            content: blog.content, contentSecondary: blog.contentSecondary || '',
            category: blog.category || '', coverImage: blog.coverImage || '',
            published: blog.published, postType: blog.postType || 'normal',
            metaTitle: blog.metaTitle || '', metaDescription: blog.metaDescription || '',
            metaKeywords: blog.metaKeywords || '', metaTitleSecondary: blog.metaTitleSecondary || '',
            metaDescriptionSecondary: blog.metaDescriptionSecondary || '', metaKeywordsSecondary: blog.metaKeywordsSecondary || '',
            canonicalUrl: blog.canonicalUrl || '',
        });
        setMediaItems(blog.media || []);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this blog post permanently?')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/blog/${id}`, { method: 'DELETE', headers: { 'x-admin-key': adminKey } });
            if (res.ok) { showMessage('Blog deleted'); fetchBlogs(); }
            else { showMessage('Failed to delete', 'error'); }
        } catch { showMessage('Network error', 'error'); }
        setLoading(false);
    };

    const togglePublish = async (blog) => {
        try {
            const res = await fetch(`/api/blog/${blog.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
                body: JSON.stringify({ published: !blog.published }),
            });
            if (res.ok) { showMessage(blog.published ? 'Unpublished' : 'Published!'); fetchBlogs(); }
        } catch { showMessage('Failed', 'error'); }
    };

    const filteredBlogs = activeTab === 'all' ? blogs : activeTab === 'published' ? blogs.filter(b => b.published) : blogs.filter(b => !b.published);
    const stats = { total: blogs.length, published: blogs.filter(b => b.published).length, drafts: blogs.filter(b => !b.published).length };

    const S = {
        input: { width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', color: '#111', boxSizing: 'border-box' },
        textarea: { width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, resize: 'vertical', outline: 'none', background: '#fff', color: '#111', lineHeight: 1.6, boxSizing: 'border-box' },
        btnPrimary: { background: BRAND_COLOR, color: '#fff', border: 'none', padding: '11px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
        btnCancel: { background: 'transparent', color: '#6b7280', border: '1px solid #d1d5db', padding: '11px 22px', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
        badge: (type) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: type === 'carousel' ? '#dbeafe' : type === 'video' ? '#fce7f3' : '#f3f4f6', color: type === 'carousel' ? '#1d4ed8' : type === 'video' ? '#be185d' : '#374151' }),
    };

    // ═══════════════════════════════════════
    // LOGIN SCREEN
    // ═══════════════════════════════════════
    if (!isAuth) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div style={{ flex: '0 0 42%', background: BRAND_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                    <div style={{ textAlign: 'center', color: '#fff' }}>
                        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 auto 20px', letterSpacing: 2 }}>{BRAND_LOGO}</div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 6 }}>{BRAND_NAME}</h2>
                        <p style={{ fontSize: '1.1rem', opacity: 0.65 }}>Blog Management System</p>
                    </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: '#fafafa' }}>
                    <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: 420 }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', marginBottom: 6 }}>Welcome Back</h1>
                        <p style={{ fontSize: '1.1rem', color: '#888', marginBottom: 32 }}>Sign in to manage blog content</p>
                        {message.text && <div style={{ padding: '10px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16, background: message.type === 'error' ? '#fef2f2' : '#dcfce7', color: message.type === 'error' ? '#dc2626' : '#166534', border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}` }}>{message.text}</div>}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Admin ID</label>
                            <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter admin ID" style={S.input} required />
                        </div>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" style={S.input} required />
                        </div>
                        <button type="submit" style={{ ...S.btnPrimary, width: '100%' }}>Sign In</button>
                    </form>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // DASHBOARD
    // ═══════════════════════════════════════
    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Sidebar */}
            <aside style={{ width: 260, background: '#1a1a2e', color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, fontSize: '1.2rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: BRAND_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', fontWeight: 900, letterSpacing: 1 }}>{BRAND_LOGO}</div>
                    <span>Blog Admin</span>
                </div>
                <nav style={{ padding: '16px 12px', flex: 1 }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', border: 'none', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, cursor: 'pointer' }}>📄 Blog Posts</button>
                </nav>
                <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button onClick={() => setIsAuth(false)} style={{ padding: '10px 16px', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', width: '100%', textAlign: 'left' }}>Sign Out</button>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, marginLeft: 260, background: '#f8f9fa', minHeight: '100vh' }}>
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 36px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111' }}>Blog Posts</h1>
                        <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 2 }}>Manage your articles and content</p>
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true); }} style={S.btnPrimary}>+ New Post</button>
                </header>

                {message.text && <div style={{ margin: '16px 36px 0', padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, background: message.type === 'error' ? '#fef2f2' : '#dcfce7', color: message.type === 'error' ? '#dc2626' : '#166534', border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}` }}>{message.text}</div>}

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, padding: '28px 36px 0' }}>
                    {[{ n: stats.total, l: 'Total Posts', c: '#111' }, { n: stats.published, l: 'Published', c: '#16a34a' }, { n: stats.drafts, l: 'Drafts', c: '#d97706' }].map((s, i) => (
                        <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: s.c }}>{s.n}</span>
                            <span style={{ display: 'block', fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, marginTop: 4 }}>{s.l}</span>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, padding: '24px 36px 0' }}>
                    {['all', 'published', 'drafts'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: activeTab === tab ? '#111' : 'transparent', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, color: activeTab === tab ? '#fff' : '#6b7280', cursor: 'pointer' }}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, padding: '0 6px', borderRadius: 12, background: activeTab === tab ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)', fontSize: 11, fontWeight: 600 }}>
                                {tab === 'all' ? stats.total : tab === 'published' ? stats.published : stats.drafts}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Blog Table */}
                <div style={{ margin: '20px 36px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                    {loading && blogs.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading...</p>
                    ) : filteredBlogs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                            <p style={{ fontSize: 14, marginBottom: 16 }}>No posts found</p>
                            <button onClick={() => { resetForm(); setShowForm(true); }} style={S.btnPrimary}>Create Your First Post</button>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Post', 'Type', 'Category', 'Status', 'Date', 'Actions'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBlogs.map(blog => (
                                    <tr key={blog.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                                        <td style={{ padding: '16px 20px', fontSize: 14 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                {blog.coverImage && <img src={blog.coverImage} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />}
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#111', marginBottom: 2 }}>{blog.title}</div>
                                                    <div style={{ fontSize: 12, color: '#9ca3af' }}>/blog/{blog.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}><span style={S.badge(blog.postType)}>{blog.postType}</span></td>
                                        <td style={{ padding: '16px 20px' }}><span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(37,99,235,0.08)', color: BRAND_COLOR }}>{blog.category}</span></td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <button onClick={() => togglePublish(blog)} style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', background: blog.published ? '#dcfce7' : '#fef3c7', color: blog.published ? '#166534' : '#92400e' }}>
                                                {blog.published ? 'Published' : 'Draft'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: 12, color: '#9ca3af' }}>
                                            {new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => handleEdit(blog)} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 14 }}>✏️</button>
                                                <button onClick={() => handleDelete(blog.id)} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: 14 }}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* ═══════════════════════════════════════ */}
            {/* MODAL FORM                              */}
            {/* ═══════════════════════════════════════ */}
            {showForm && (
                <div onClick={resetForm} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 200, padding: '40px 20px', overflowY: 'auto' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, maxWidth: 800, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderBottom: '1px solid #f3f4f6' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111' }}>{editingBlog ? 'Edit Post' : 'New Blog Post'}</h2>
                            <button onClick={resetForm} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 8, background: '#f3f4f6', fontSize: '1.3rem', color: '#6b7280', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {/* Post Type */}
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Post Type</label>
                                <div style={{ display: 'flex', gap: 0, border: '1px solid #d1d5db', borderRadius: 8, overflow: 'hidden', width: 'fit-content' }}>
                                    {['normal', 'carousel', 'video'].map(t => (
                                        <button key={t} type="button" onClick={() => setFormData(p => ({ ...p, postType: t }))}
                                            style={{ padding: '8px 18px', border: 'none', background: formData.postType === t ? '#111' : '#fff', fontSize: 13, fontWeight: 500, color: formData.postType === t ? '#fff' : '#6b7280', cursor: 'pointer', borderRight: t !== 'video' ? '1px solid #d1d5db' : 'none' }}>
                                            {t === 'normal' ? '📄 Article' : t === 'carousel' ? '🖼️ Carousel' : '🎬 Video'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Language Toggle */}
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Content Language</label>
                                <div style={{ display: 'flex', gap: 0, border: '1px solid #d1d5db', borderRadius: 8, overflow: 'hidden', width: 'fit-content' }}>
                                    {[{ k: 'primary', l: `${PRIMARY_FLAG} ${PRIMARY_LANG}` }, { k: 'secondary', l: `${SECONDARY_FLAG} ${SECONDARY_LANG}` }].map(({ k, l }) => (
                                        <button key={k} type="button" onClick={() => setContentLang(k)}
                                            style={{ padding: '8px 18px', border: 'none', background: contentLang === k ? BRAND_COLOR : '#fff', fontSize: 13, fontWeight: 500, color: contentLang === k ? '#fff' : '#6b7280', cursor: 'pointer', borderRight: k === 'primary' ? '1px solid #d1d5db' : 'none' }}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title & Slug */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                        {contentLang === 'primary' ? `Title (${PRIMARY_LANG}) *` : `Title (${SECONDARY_LANG})`}
                                    </label>
                                    <input name={contentLang === 'primary' ? 'title' : 'titleSecondary'} value={contentLang === 'primary' ? formData.title : formData.titleSecondary} onChange={handleFormChange} style={S.input} placeholder="Blog post title" required={contentLang === 'primary'} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>URL Slug *</label>
                                    <input name="slug" value={formData.slug} onChange={handleFormChange} style={S.input} placeholder="auto-generated-from-title" required />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Category *</label>
                                <input name="category" value={formData.category} onChange={handleFormChange} style={S.input} placeholder="e.g. Industry, News, Tips" required />
                            </div>

                            {/* Cover Image */}
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Cover Image</label>
                                <div style={{ display: 'flex', gap: 0, border: '1px solid #d1d5db', borderRadius: 8, overflow: 'hidden', width: 'fit-content', marginBottom: 8 }}>
                                    <button type="button" onClick={() => setUploadMode('url')} style={{ padding: '8px 18px', border: 'none', background: uploadMode === 'url' ? '#111' : '#fff', fontSize: 13, fontWeight: 500, color: uploadMode === 'url' ? '#fff' : '#6b7280', cursor: 'pointer', borderRight: '1px solid #d1d5db' }}>Paste URL</button>
                                    <button type="button" onClick={() => setUploadMode('file')} style={{ padding: '8px 18px', border: 'none', background: uploadMode === 'file' ? '#111' : '#fff', fontSize: 13, fontWeight: 500, color: uploadMode === 'file' ? '#fff' : '#6b7280', cursor: 'pointer' }}>Upload File</button>
                                </div>
                                {uploadMode === 'url' ? (
                                    <input name="coverImage" value={formData.coverImage} onChange={handleFormChange} style={S.input} placeholder="https://..." />
                                ) : (
                                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, false)} style={{ fontSize: 13 }} />
                                )}
                                {formData.coverImage && <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', maxHeight: 160 }}><img src={formData.coverImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></div>}
                            </div>

                            {/* Media (carousel/video) */}
                            {(formData.postType === 'carousel' || formData.postType === 'video') && (
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                        {formData.postType === 'carousel' ? '🖼️ Carousel Images' : '🎬 Video File'}
                                    </label>
                                    <input type="file" accept={formData.postType === 'carousel' ? 'image/*' : 'video/*'} onChange={e => handleFileUpload(e, true)} multiple={formData.postType === 'carousel'} style={{ fontSize: 13, marginBottom: 8 }} />
                                    {mediaItems.length > 0 && (
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                                            {mediaItems.map((m, idx) => (
                                                <div key={idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                                    {m.mediaType === 'video' ? <video src={m.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={m.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    <button type="button" onClick={() => removeMedia(idx)} style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Excerpt */}
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                    {contentLang === 'primary' ? `Excerpt (${PRIMARY_LANG}) *` : `Excerpt (${SECONDARY_LANG})`}
                                </label>
                                <textarea name={contentLang === 'primary' ? 'excerpt' : 'excerptSecondary'} value={contentLang === 'primary' ? formData.excerpt : formData.excerptSecondary} onChange={handleFormChange} style={S.textarea} rows={2} placeholder="Brief summary..." required={contentLang === 'primary'} />
                            </div>

                            {/* Content */}
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                    {contentLang === 'primary' ? `Content (${PRIMARY_LANG}) *` : `Content (${SECONDARY_LANG})`} <span style={{ fontWeight: 400, color: '#9ca3af' }}>(Markdown)</span>
                                </label>
                                <textarea name={contentLang === 'primary' ? 'content' : 'contentSecondary'} value={contentLang === 'primary' ? formData.content : formData.contentSecondary} onChange={handleFormChange} style={{ ...S.textarea, fontFamily: "'JetBrains Mono', 'Courier New', monospace", lineHeight: 1.7 }} rows={14} placeholder="Write content here..." required={contentLang === 'primary'} />
                            </div>

                            {/* SEO */}
                            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 20, marginTop: 8 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
                                    🔍 SEO Settings <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>({contentLang === 'primary' ? PRIMARY_LANG : SECONDARY_LANG})</span>
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>SEO Title</label>
                                        <input name={contentLang === 'primary' ? 'metaTitle' : 'metaTitleSecondary'} value={contentLang === 'primary' ? formData.metaTitle : formData.metaTitleSecondary} onChange={handleFormChange} style={S.input} placeholder="Custom page title for search engines" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>SEO Description</label>
                                        <textarea name={contentLang === 'primary' ? 'metaDescription' : 'metaDescriptionSecondary'} value={contentLang === 'primary' ? formData.metaDescription : formData.metaDescriptionSecondary} onChange={handleFormChange} style={S.textarea} rows={2} placeholder="Meta description (150-160 chars)" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>SEO Keywords</label>
                                        <input name={contentLang === 'primary' ? 'metaKeywords' : 'metaKeywordsSecondary'} value={contentLang === 'primary' ? formData.metaKeywords : formData.metaKeywordsSecondary} onChange={handleFormChange} style={S.input} placeholder="Comma-separated keywords" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Canonical URL <span style={{ fontWeight: 400, color: '#9ca3af' }}>(override)</span></label>
                                        <input name="canonicalUrl" value={formData.canonicalUrl} onChange={handleFormChange} style={S.input} placeholder="Leave blank for /blog/{slug}" />
                                    </div>
                                </div>
                            </div>

                            {/* Publish */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input type="checkbox" name="published" checked={formData.published} onChange={handleFormChange} id="published" style={{ width: 18, height: 18, accentColor: BRAND_COLOR }} />
                                <label htmlFor="published" style={{ fontSize: 14, color: '#374151' }}>Publish immediately</label>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
                                <button type="button" onClick={resetForm} style={S.btnCancel}>Cancel</button>
                                <button type="submit" style={{ ...S.btnPrimary, opacity: loading ? 0.5 : 1 }} disabled={loading}>
                                    {loading ? 'Saving...' : editingBlog ? 'Update Post' : 'Publish Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
```

---

## 10. Blog Listing Page

**File**: `src/app/blog/page.jsx`

```jsx
import BlogClient from './BlogClient';

// CUSTOMIZE: Update meta for your site
export const metadata = {
    title: 'Blog & News — Your Brand',
    description: 'Read the latest articles, insights, and news.',
    keywords: 'blog, news, articles, insights',
    openGraph: {
        title: 'Blog & News — Your Brand',
        description: 'Articles, insights, and news.',
        url: 'https://yourdomain.com/blog',
    },
    alternates: { canonical: '/blog' },
};

export default function BlogPage() {
    return <BlogClient />;
}
```

---

## 11. Blog Listing Client

**File**: `src/app/blog/BlogClient.jsx`

> **NOTE**: This uses `useLanguage()` from a language context. If your site doesn't have one, remove the import and hardcode `lang = 'en'`.

```jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════
// CUSTOMIZE THESE VALUES
// ═══════════════════════════════════════════════════════
const BRAND_COLOR = '#2563eb';
const BRAND_GRADIENT = 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2563eb 100%)';
const ACCENT_COLOR = '#F5C563';
// If your site has a language context, import it:
// import { useLanguage } from '@/context/language';
// Otherwise, set lang = 'en' or 'primary' below.
// ═══════════════════════════════════════════════════════

const TYPE_ICONS = { normal: '📄', carousel: '🖼️', video: '🎬' };

export default function BlogClient() {
    // const { lang } = useLanguage();  // Uncomment if you have language context
    const lang = 'en';  // Remove this line if using useLanguage above

    const [blogs, setBlogs] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBlogs() {
            try {
                const res = await fetch('/api/blog?published=true');
                if (res.ok) { setBlogs(await res.json()); }
            } catch { /* silent */ }
            setLoading(false);
        }
        fetchBlogs();
    }, []);

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const getTitle = (b) => (lang !== 'en' && b.titleSecondary) ? b.titleSecondary : b.title;
    const getExcerpt = (b) => (lang !== 'en' && b.excerptSecondary) ? b.excerptSecondary : b.excerpt;

    const categories = ['all', ...new Set(blogs.map(b => b.category).filter(Boolean))];
    const filtered = selectedCategory === 'all' ? blogs : blogs.filter(b => b.category === selectedCategory);
    const displayed = showAll ? filtered : filtered.slice(0, 6);

    return (
        <>
            {/* Banner */}
            <section style={{ position: 'relative', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BRAND_GRADIENT, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '80px 20px 60px' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                        News & <span style={{ color: ACCENT_COLOR }}>Blog</span>
                    </h1>
                    <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: '0 auto' }}>
                        Industry insights, tips, and guidance
                    </p>
                </div>
            </section>

            <section style={{ padding: '60px 0 80px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                    {/* Category Filter */}
                    {categories.length > 1 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40, justifyContent: 'center' }}>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => { setSelectedCategory(cat); setShowAll(false); }}
                                    style={{ padding: '8px 20px', borderRadius: 50, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: selectedCategory === cat ? BRAND_COLOR : '#f3f4f6', color: selectedCategory === cat ? '#fff' : '#6b7280', transition: 'all 0.2s' }}>
                                    {cat === 'all' ? 'All' : cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Grid */}
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>Loading...</p>
                    ) : displayed.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: 18, fontWeight: 600 }}>Posts coming soon</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 28 }}>
                            {displayed.map(b => (
                                <Link key={b.slug} href={`/blog/${b.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <article style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)'; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}>
                                        <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                                            {b.coverImage ? (
                                                <img src={b.coverImage} alt={getTitle(b)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, #262626, ${BRAND_COLOR})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '4rem', fontWeight: 800 }}>
                                                    {b.category?.charAt(0) || 'B'}
                                                </div>
                                            )}
                                            {b.postType !== 'normal' && <span style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: 'rgba(0,0,0,0.6)', color: '#fff' }}>{TYPE_ICONS[b.postType]} {b.postType}</span>}
                                        </div>
                                        <div style={{ padding: '20px 24px 24px' }}>
                                            <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(37,99,235,0.08)', color: BRAND_COLOR, marginBottom: 10 }}>{b.category}</span>
                                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{getTitle(b)}</h3>
                                            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#6b7280', marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{getExcerpt(b)}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: 12, color: '#9ca3af' }}>{formatDate(b.createdAt)}</span>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: BRAND_COLOR }}>Read More →</span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!showAll && filtered.length > 6 && (
                        <div style={{ textAlign: 'center', marginTop: 48 }}>
                            <button onClick={() => setShowAll(true)} style={{ background: BRAND_COLOR, color: '#fff', padding: '14px 36px', borderRadius: 50, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', border: 'none' }}>View All ({filtered.length})</button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
```

---

## 12. Blog Detail Page

**File**: `src/app/blog/[slug]/page.jsx`

```jsx
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';
import { getBlogBySlugPublished, mapBlog, mapMedia } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Your Brand';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const blog = await getBlogBySlugPublished(slug);

    if (!blog) return { title: `Article Not Found | ${SITE_NAME}` };

    const title = blog.metaTitle || `${blog.title} | ${SITE_NAME}`;
    const description = blog.metaDescription || blog.excerpt || blog.title;
    const keywords = blog.metaKeywords || '';
    const canonical = blog.canonicalUrl || `/blog/${slug}`;

    return {
        title, description,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
        openGraph: {
            title, description,
            type: 'article',
            url: `${SITE_URL}/blog/${slug}`,
            siteName: SITE_NAME,
            images: blog.coverImage ? [{ url: blog.coverImage.startsWith('/') ? `${SITE_URL}${blog.coverImage}` : blog.coverImage }] : undefined,
        },
        twitter: { card: 'summary_large_image', title, description },
        alternates: { canonical },
    };
}

export default async function BlogDetailPage({ params }) {
    const { slug } = await params;
    const blog = await getBlogBySlugPublished(slug);
    if (!blog) notFound();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: blog.title,
        description: blog.excerpt,
        image: blog.coverImage ? (blog.coverImage.startsWith('/') ? `${SITE_URL}${blog.coverImage}` : blog.coverImage) : undefined,
        datePublished: blog.createdAt,
        dateModified: blog.updatedAt || blog.createdAt,
        author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${slug}` },
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <BlogDetailClient blog={blog} />
        </>
    );
}
```

---

## 13. Blog Detail Client

**File**: `src/app/blog/[slug]/BlogDetailClient.jsx`

```jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// ═══════════════════════════════════════════════════════
// CUSTOMIZE
// ═══════════════════════════════════════════════════════
const BRAND_COLOR = '#2563eb';
const BRAND_GRADIENT = 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2563eb 100%)';
const ACCENT_COLOR = '#F5C563';
const SITE_NAME = 'Your Brand';
// ═══════════════════════════════════════════════════════

export default function BlogDetailClient({ blog }) {
    // const { lang } = useLanguage();  // Uncomment if using language context
    const lang = 'en';
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const getTitle = () => (lang !== 'en' && blog.titleSecondary) ? blog.titleSecondary : blog.title;
    const getContent = () => (lang !== 'en' && blog.contentSecondary) ? blog.contentSecondary : blog.content;

    const carouselImages = blog.media?.filter(m => m.mediaType === 'image') || [];
    const videoMedia = blog.media?.find(m => m.mediaType === 'video');

    // Markdown renderer
    const renderContent = (content) => {
        if (!content) return null;
        return content.split('\n\n').map((block, i) => {
            if (block.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.8rem', fontWeight: 700, color: '#262626', margin: '40px 0 16px', paddingBottom: 10, borderBottom: `2px solid rgba(37,99,235,0.1)` }}>{block.slice(3)}</h2>;
            if (block.startsWith('# ')) return <h1 key={i} style={{ fontSize: '2.4rem', fontWeight: 800, color: '#262626', margin: '40px 0 16px' }}>{block.slice(2)}</h1>;
            if (block.includes('\n- ')) {
                const lines = block.split('\n');
                const intro = lines[0] && !lines[0].startsWith('- ') ? lines[0] : null;
                const items = lines.filter(l => l.startsWith('- '));
                return (
                    <div key={i}>
                        {intro && <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#4A5568', margin: '16px 0 8px' }}>{intro}</p>}
                        <ul style={{ paddingLeft: 20, margin: '12px 0 20px', lineHeight: 1.9, color: '#4A5568', listStyleType: 'none' }}>
                            {items.map((line, j) => {
                                const text = line.replace(/^- /, '');
                                const parts = text.split(/\*\*(.*?)\*\*/g);
                                return (
                                    <li key={j} style={{ paddingLeft: 24, position: 'relative', marginBottom: 6 }}>
                                        <span style={{ position: 'absolute', left: 0, top: 10, width: 6, height: 6, borderRadius: '50%', background: BRAND_COLOR }} />
                                        {parts.map((part, k) => k % 2 === 1 ? <strong key={k} style={{ color: '#262626' }}>{part}</strong> : part)}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            }
            const parts = block.split(/\*\*(.*?)\*\*/g);
            return <p key={i} style={{ fontSize: '1rem', lineHeight: 1.85, color: '#4A5568', margin: '16px 0' }}>{parts.map((part, k) => k % 2 === 1 ? <strong key={k} style={{ color: '#262626' }}>{part}</strong> : part)}</p>;
        });
    };

    if (!blog) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Blog Not Found</h1>
                <Link href="/blog" style={{ color: BRAND_COLOR, fontWeight: 600 }}>← Back to Blog</Link>
            </div>
        );
    }

    return (
        <>
            {/* Hero */}
            <div style={{ position: 'relative', minHeight: 380, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                {blog.coverImage && <Image src={blog.coverImage} alt={getTitle()} fill className="object-cover object-center" priority />}
                <div style={{ position: 'absolute', inset: 0, background: blog.coverImage ? 'linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.85) 100%)' : BRAND_GRADIENT }} />
                <div style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '120px 24px 40px' }}>
                    <Link href="/blog" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: '.95rem', textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>← Back to Blog</Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <span style={{ padding: '4px 14px', borderRadius: 20, background: 'rgba(37,99,235,0.3)', color: ACCENT_COLOR, fontSize: '.85rem', fontWeight: 600 }}>{blog.category}</span>
                        {blog.postType !== 'normal' && <span style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11, fontWeight: 600 }}>{blog.postType === 'carousel' ? '🖼️ Carousel' : '🎬 Video'}</span>}
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.2, color: 'white', maxWidth: 750 }}>{getTitle()}</h1>
                    <p style={{ fontSize: '.95rem', color: 'rgba(255,255,255,0.6)', marginTop: 12 }}>{formatDate(blog.createdAt)} · {SITE_NAME}</p>
                </div>
            </div>

            {/* Carousel */}
            {blog.postType === 'carousel' && carouselImages.length > 0 && (
                <div style={{ maxWidth: 800, margin: '40px auto 0', padding: '0 24px' }}>
                    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#f3f4f6' }}>
                        <img src={carouselImages[currentSlide]?.mediaUrl} alt="" style={{ width: '100%', maxHeight: 480, objectFit: 'contain', display: 'block' }} />
                        {carouselImages.length > 1 && (
                            <>
                                <button onClick={() => setCurrentSlide(p => p > 0 ? p - 1 : carouselImages.length - 1)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer' }}>‹</button>
                                <button onClick={() => setCurrentSlide(p => p < carouselImages.length - 1 ? p + 1 : 0)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer' }}>›</button>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '12px 0' }}>
                                    {carouselImages.map((_, idx) => <button key={idx} onClick={() => setCurrentSlide(idx)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', background: idx === currentSlide ? BRAND_COLOR : '#d1d5db' }} />)}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Video */}
            {blog.postType === 'video' && videoMedia && (
                <div style={{ maxWidth: 800, margin: '40px auto 0', padding: '0 24px' }}>
                    <video src={videoMedia.mediaUrl} controls playsInline style={{ width: '100%', borderRadius: 16, background: '#000', maxHeight: 500 }} poster={blog.coverImage || undefined} />
                </div>
            )}

            {/* Content */}
            <article style={{ paddingTop: 48, paddingBottom: 80 }}>
                <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px' }}>
                    <div>{renderContent(getContent())}</div>

                    {/* CTA */}
                    <div style={{ marginTop: 56, padding: 40, borderRadius: 16, background: `linear-gradient(135deg, #262626 0%, ${BRAND_COLOR} 100%)`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(37,99,235,0.2)' }} />
                        <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: 8 }}>Need Help?</h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>Contact us to learn more about our services.</p>
                        <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 32px', background: ACCENT_COLOR, color: '#262626', borderRadius: 50, fontWeight: 600, textDecoration: 'none' }}>Get in Touch →</Link>
                    </div>
                </div>
            </article>
        </>
    );
}
```

---

## 14. .gitignore Additions

```gitignore
# Blog data (SQLite database — don't commit)
/data/

# Uploaded media files
/public/uploads/
```

---

## 15. Deployment Notes

### Server Setup
```bash
mkdir -p ~/your-app/data ~/your-app/public/uploads
cd ~/your-app
npm install
npm run build
pm2 start npm --name "myapp" -- start
```

### Deploy Cycle
```bash
# Git pull + rebuild
git pull && npm install && npm run build && pm2 restart myapp
```

### SQLite Backup
```bash
cp ~/your-app/data/blog.db ~/backups/blog-$(date +%Y%m%d).db
```

### PostgreSQL Backup
```bash
pg_dump $DATABASE_URL > ~/backups/blog-$(date +%Y%m%d).sql
```

---

## 16. Customization Guide

### Quick-Change Table

| What | Where | Default |
|---|---|---|
| Admin ID | `admin/page.jsx` → `ADMIN_ID` | `admin` |
| Admin Password | `.env.local` → `ADMIN_SECRET` | — |
| Brand Color | All files → `BRAND_COLOR` | `#2563eb` |
| Brand Name | `admin/page.jsx` → `BRAND_NAME` | `My Website` |
| Logo Text | `admin/page.jsx` → `BRAND_LOGO` | `MW` |
| Site URL | `.env.local` → `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
| Primary Language | `admin/page.jsx` → `PRIMARY_LANG` | `English` |
| Secondary Language | `admin/page.jsx` → `SECONDARY_LANG` | `Secondary` |
| DB Type | `.env.local` → `DB_TYPE` | `sqlite` |
| Postgres URL | `.env.local` → `DATABASE_URL` | — |
| CTA Section | `BlogDetailClient.jsx` bottom | Contact box |
| Date Format | All client files | `en-IN` |
| Accent Color | All client files → `ACCENT_COLOR` | `#F5C563` |

### Removing Bilingual Support
1. Remove all `*Secondary` fields from admin `formData`
2. Remove the language toggle
3. Remove `title_secondary` etc. from DB schema
4. Simplify `getTitle()` to `blog.title`

### API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/blog` | No | List all blogs |
| GET | `/api/blog?published=true` | No | Published only |
| POST | `/api/blog` | `x-admin-key` | Create blog |
| GET | `/api/blog/:id` | No | Get by ID or slug |
| PUT | `/api/blog/:id` | `x-admin-key` | Update blog |
| DELETE | `/api/blog/:id` | `x-admin-key` | Delete blog |
| POST | `/api/upload` | `x-admin-key` | Upload file |

---

> **Last Updated**: April 2026
> **Tested With**: Next.js 15–16, better-sqlite3 11.x, pg 8.x, Node.js 20 LTS
