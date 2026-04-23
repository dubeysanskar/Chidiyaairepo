"use client";

import { useState, useEffect } from "react";

export default function AdminBlogPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [activeTab, setActiveTab] = useState("all");
    const [formData, setFormData] = useState({
        title: "", slug: "", excerpt: "", content: "", category: "",
        coverImage: "", published: false, postType: "normal",
        metaTitle: "", metaDescription: "", metaKeywords: "",
    });

    const ADMIN_KEY = "chidiyaai-secret-key-2024";

    useEffect(() => { fetchBlogs(); }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch("/api/blog");
            if (res.ok) setBlogs(await res.json());
        } catch { /* silent */ }
        setLoading(false);
    };

    const showMsg = (text, type = "success") => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
        if (name === "title" && !editingBlog) {
            setFormData(p => ({ ...p, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
        }
    };

    const resetForm = () => {
        setFormData({ title: "", slug: "", excerpt: "", content: "", category: "", coverImage: "", published: false, postType: "normal", metaTitle: "", metaDescription: "", metaKeywords: "" });
        setEditingBlog(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = editingBlog ? `/api/blog/${editingBlog.id}` : "/api/blog";
            const method = editingBlog ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
                body: JSON.stringify(formData),
            });
            if (res.ok) { showMsg(editingBlog ? "Blog updated!" : "Blog created!"); resetForm(); fetchBlogs(); }
            else { const err = await res.json(); showMsg(err.error || "Failed", "error"); }
        } catch { showMsg("Network error", "error"); }
        setLoading(false);
    };

    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title, slug: blog.slug, excerpt: blog.excerpt || "",
            content: blog.content, category: blog.category || "",
            coverImage: blog.coverImage || "", published: blog.published,
            postType: blog.postType || "normal", metaTitle: blog.metaTitle || "",
            metaDescription: blog.metaDescription || "", metaKeywords: blog.metaKeywords || "",
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this blog post permanently?")) return;
        try {
            const res = await fetch(`/api/blog/${id}`, { method: "DELETE", headers: { "x-admin-key": ADMIN_KEY } });
            if (res.ok) { showMsg("Blog deleted"); fetchBlogs(); }
            else showMsg("Failed to delete", "error");
        } catch { showMsg("Network error", "error"); }
    };

    const togglePublish = async (blog) => {
        try {
            const res = await fetch(`/api/blog/${blog.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
                body: JSON.stringify({ published: !blog.published }),
            });
            if (res.ok) { showMsg(blog.published ? "Unpublished" : "Published!"); fetchBlogs(); }
        } catch { showMsg("Failed", "error"); }
    };

    const filteredBlogs = activeTab === "all" ? blogs : activeTab === "published" ? blogs.filter(b => b.published) : blogs.filter(b => !b.published);
    const stats = { total: blogs.length, published: blogs.filter(b => b.published).length, drafts: blogs.filter(b => !b.published).length };

    const S = {
        input: { width: "100%", padding: "11px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff", color: "#111", boxSizing: "border-box" },
        textarea: { width: "100%", padding: "11px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, resize: "vertical", outline: "none", background: "#fff", color: "#111", lineHeight: 1.6, boxSizing: "border-box" },
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>Blog Posts</h1>
                    <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>Manage your articles and content</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }} style={{ padding: "10px 20px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                    + New Post
                </button>
            </div>

            {message.text && <div style={{ padding: "10px 16px", borderRadius: 8, fontSize: 14, marginBottom: 16, background: message.type === "error" ? "#fef2f2" : "#dcfce7", color: message.type === "error" ? "#dc2626" : "#166534", border: `1px solid ${message.type === "error" ? "#fecaca" : "#bbf7d0"}` }}>{message.text}</div>}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: "24px" }}>
                {[{ n: stats.total, l: "Total", c: "#0f172a" }, { n: stats.published, l: "Published", c: "#16a34a" }, { n: stats.drafts, l: "Drafts", c: "#d97706" }].map((s, i) => (
                    <div key={i} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px" }}>
                        <span style={{ fontSize: "28px", fontWeight: 800, color: s.c }}>{s.n}</span>
                        <span style={{ display: "block", fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500, marginTop: 4 }}>{s.l}</span>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: "20px" }}>
                {["all", "published", "drafts"].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        style={{ padding: "8px 16px", background: activeTab === tab ? "#0f172a" : "transparent", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontWeight: 500, color: activeTab === tab ? "#fff" : "#6b7280", cursor: "pointer" }}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === "all" ? stats.total : tab === "published" ? stats.published : stats.drafts})
                    </button>
                ))}
            </div>

            {/* Blog Table */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                {loading && blogs.length === 0 ? (
                    <p style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Loading...</p>
                ) : filteredBlogs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                        <p style={{ fontSize: 14, marginBottom: 16 }}>No posts found</p>
                        <button onClick={() => { resetForm(); setShowForm(true); }} style={{ padding: "10px 20px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Create Your First Post</button>
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {["Post", "Category", "Status", "Date", "Actions"].map(h => (
                                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBlogs.map(blog => (
                                <tr key={blog.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                                    <td style={{ padding: "14px 16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            {blog.coverImage && <img src={blog.coverImage} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />}
                                            <div>
                                                <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{blog.title}</div>
                                                <div style={{ fontSize: 12, color: "#94a3b8" }}>/blog/{blog.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 16px" }}><span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: "rgba(59,130,246,0.08)", color: "#3b82f6" }}>{blog.category || "—"}</span></td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <button onClick={() => togglePublish(blog)} style={{ padding: "3px 12px", borderRadius: 12, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", background: blog.published ? "#dcfce7" : "#fef3c7", color: blog.published ? "#166534" : "#92400e" }}>
                                            {blog.published ? "Published" : "Draft"}
                                        </button>
                                    </td>
                                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8" }}>{new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button onClick={() => handleEdit(blog)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }}>✏️</button>
                                            <button onClick={() => handleDelete(blog.id)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14, color: "#ef4444" }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Form */}
            {showForm && (
                <div onClick={resetForm} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, padding: "40px 20px", overflowY: "auto" }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, maxWidth: 720, width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid #f1f5f9" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>{editingBlog ? "Edit Post" : "New Blog Post"}</h2>
                            <button onClick={resetForm} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: 8, background: "#f1f5f9", fontSize: "18px", color: "#64748b", cursor: "pointer" }}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                            {/* Post Type */}
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Post Type</label>
                                <div style={{ display: "flex", gap: 0, border: "1px solid #d1d5db", borderRadius: 8, overflow: "hidden", width: "fit-content" }}>
                                    {["normal", "carousel", "video"].map(t => (
                                        <button key={t} type="button" onClick={() => setFormData(p => ({ ...p, postType: t }))}
                                            style={{ padding: "8px 16px", border: "none", background: formData.postType === t ? "#0f172a" : "#fff", fontSize: 13, fontWeight: 500, color: formData.postType === t ? "#fff" : "#6b7280", cursor: "pointer" }}>
                                            {t === "normal" ? "📄 Article" : t === "carousel" ? "🖼️ Carousel" : "🎬 Video"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Title & Slug */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Title *</label>
                                    <input name="title" value={formData.title} onChange={handleFormChange} style={S.input} placeholder="Blog post title" required />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>URL Slug *</label>
                                    <input name="slug" value={formData.slug} onChange={handleFormChange} style={S.input} placeholder="auto-generated" required />
                                </div>
                            </div>
                            {/* Category & Cover */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Category *</label>
                                    <input name="category" value={formData.category} onChange={handleFormChange} style={S.input} placeholder="e.g. Industry, News" required />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Cover Image URL</label>
                                    <input name="coverImage" value={formData.coverImage} onChange={handleFormChange} style={S.input} placeholder="https://..." />
                                </div>
                            </div>
                            {/* Excerpt */}
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Excerpt *</label>
                                <textarea name="excerpt" value={formData.excerpt} onChange={handleFormChange} style={S.textarea} rows={2} placeholder="Brief summary..." required />
                            </div>
                            {/* Content */}
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Content * <span style={{ fontWeight: 400, color: "#94a3b8" }}>(Markdown)</span></label>
                                <textarea name="content" value={formData.content} onChange={handleFormChange} style={{ ...S.textarea, fontFamily: "monospace", lineHeight: 1.7 }} rows={12} placeholder="Write content here..." required />
                            </div>
                            {/* SEO */}
                            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                                <h3 style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>🔍 SEO Settings</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    <input name="metaTitle" value={formData.metaTitle} onChange={handleFormChange} style={S.input} placeholder="SEO Title" />
                                    <textarea name="metaDescription" value={formData.metaDescription} onChange={handleFormChange} style={S.textarea} rows={2} placeholder="Meta description (150-160 chars)" />
                                    <input name="metaKeywords" value={formData.metaKeywords} onChange={handleFormChange} style={S.input} placeholder="Comma-separated keywords" />
                                </div>
                            </div>
                            {/* Publish */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <input type="checkbox" name="published" checked={formData.published} onChange={handleFormChange} id="pub" style={{ width: 18, height: 18, accentColor: "#3b82f6" }} />
                                <label htmlFor="pub" style={{ fontSize: 14, color: "#374151" }}>Publish immediately</label>
                            </div>
                            {/* Actions */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                                <button type="button" onClick={resetForm} style={{ padding: "10px 20px", background: "transparent", color: "#64748b", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
                                <button type="submit" disabled={loading} style={{ padding: "10px 20px", backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.5 : 1 }}>
                                    {loading ? "Saving..." : editingBlog ? "Update Post" : "Publish Post"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
