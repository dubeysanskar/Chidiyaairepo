"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useIsMobile } from "../../hooks/useIsMobile";

export default function SupplierDashboard() {
    // Notification State
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Tabs
    const [activeTab, setActiveTab] = useState("dashboard");
    const [stats, setStats] = useState({
        totalInquiries: 0,
        quotesSubmitted: 0,
        acceptedDeals: 0,
        conversionRate: 0,
        profileViews: 0,
        leadAcceptRate: 0
    });
    const [inquiries, setInquiries] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [supplierProfile, setSupplierProfile] = useState({});
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [quoteForm, setQuoteForm] = useState({ price: "", moq: "", timeline: "", notes: "" });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isMobile = useIsMobile();

    // Analytics State
    const [analyticsPeriod, setAnalyticsPeriod] = useState("monthly");
    const [analyticsData, setAnalyticsData] = useState({
        monthly: {
            inquiries: [12, 18, 15, 22, 19, 25],
            quotes: [8, 14, 11, 18, 15, 20],
            deals: [3, 5, 4, 7, 6, 8],
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]
        },
        sixMonths: {
            inquiries: [45, 52, 48, 61, 55, 68],
            quotes: [32, 38, 35, 45, 40, 50],
            deals: [12, 15, 13, 18, 16, 20],
            labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"]
        },
        yearly: {
            inquiries: [120, 135, 142, 158, 171, 185, 192, 205, 218, 230, 245, 260],
            quotes: [85, 92, 98, 110, 118, 128, 135, 145, 152, 163, 175, 188],
            deals: [32, 35, 38, 42, 45, 50, 53, 58, 62, 65, 70, 75],
            labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"]
        }
    });

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({});
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [profileSaving, setProfileSaving] = useState(false);

    // Product Modal State
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [productForm, setProductForm] = useState({
        name: "",
        localName: "",  // Local/Common Name (optional)
        category: "",   // Strict dropdown
        description: "",
        minPrice: "",
        maxPrice: "",
        priceUnit: "piece",  // piece, box, meter, kg
        moq: "",        // Number only
        leadTime: "7-10 days",  // Dropdown
        // Checkboxes
        materials: [],   // Paper, Kraft, Duplex
        usage: [],       // Packaging, Shipping, Storage
        strength: [],    // Light, Medium, Heavy
        images: []
    });
    const [productSaving, setProductSaving] = useState(false);
    const [productImagePreviews, setProductImagePreviews] = useState([]);

    const categoryOptions = [
        "Corrugated Boxes",
        "Paper Cups",
        "Bubble Wrap",
        "BOPP Tapes",
        "Shipping Bags",
        "Packaging Foam",
        "Cardboard Sheets",
        "Kraft Paper",
        "Other"
    ];
    const materialOptions = ["Paper", "Kraft", "Duplex", "Plastic", "Foam"];
    const usageOptions = ["Packaging", "Shipping", "Storage", "Display"];
    const strengthOptions = ["Light", "Medium", "Heavy"];
    const priceUnitOptions = ["piece", "box", "meter", "kg", "pack"];
    const leadTimeOptions = ["3-5 days", "7-10 days", "15-20 days", "Custom"];

    // Products/Categories State
    const [productCategorySubTab, setProductCategorySubTab] = useState("addProduct");
    const [supplierCategories, setSupplierCategories] = useState([]);
    const [categoryTemplates, setCategoryTemplates] = useState([]);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [categoryForm, setCategoryForm] = useState({ categoryId: "", description: "", customCategoryName: "" });
    const [categorySaving, setCategorySaving] = useState(false);

    // Add Product Form State (new enhanced version)
    const [addProductStep, setAddProductStep] = useState(1);
    const [selectedCategoryForProduct, setSelectedCategoryForProduct] = useState(null);
    const [addProductForm, setAddProductForm] = useState({
        name: "",
        description: "",
        price: "",
        priceUnit: "Piece",
        supplierCategoryId: "",
        categoryTemplateId: "",
        images: [],
        specifications: {},
        otherSpecs: {},  // For "Other" text inputs
        additionalInfo: "" // Free text for local names, etc.
    });
    const [addProductImages, setAddProductImages] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch("/api/supplier/dashboard");
            if (res.status === 401) {
                window.location.href = "/supplier/login";
                return;
            }
            if (res.status === 403) {
                // Supplier not approved yet
                window.location.href = "/supplier/pending";
                return;
            }
            const data = await res.json();

            if (res.ok) {
                setStats(data.stats);
                setInquiries(data.inquiries || []);
                setQuotes(data.quotes || []);
                setSupplierProfile(data.supplier || {});
                setProducts(data.products || []);
            }

            // Fetch category templates
            fetchCategoryTemplates();
            // Fetch supplier categories
            fetchSupplierCategories();
        } catch (error) {
            console.error("Failed to fetch dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryTemplates = async () => {
        try {
            const res = await fetch("/api/categories/templates");
            const data = await res.json();
            if (res.ok) {
                setCategoryTemplates(data.categories || []);
            }
        } catch (error) {
            console.error("Failed to fetch category templates", error);
        }
    };

    const fetchSupplierCategories = async () => {
        try {
            const res = await fetch("/api/supplier/categories");
            const data = await res.json();
            if (res.ok) {
                setSupplierCategories(data.categories || []);
            }
        } catch (error) {
            console.error("Failed to fetch supplier categories", error);
        }
    };

    const handleRequestCategory = async () => {
        if (!categoryForm.categoryId) {
            showNotification("Please select a category", "error");
            return;
        }
        if (categoryForm.categoryId === "other" && !categoryForm.customCategoryName.trim()) {
            showNotification("Please enter a custom category name", "error");
            return;
        }
        setCategorySaving(true);
        try {
            const res = await fetch("/api/supplier/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categoryTemplateId: categoryForm.categoryId === "other" ? null : categoryForm.categoryId,
                    customCategoryName: categoryForm.categoryId === "other" ? categoryForm.customCategoryName.trim() : null,
                    description: categoryForm.description
                })
            });
            const data = await res.json();
            if (res.ok) {
                showNotification("Category requested successfully!", "success");
                setShowAddCategoryModal(false);
                setCategoryForm({ categoryId: "", description: "", customCategoryName: "" });
                fetchSupplierCategories();
            } else {
                showNotification(data.error || "Failed to request category", "error");
            }
        } catch (error) {
            showNotification("Failed to request category", "error");
        } finally {
            setCategorySaving(false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            const res = await fetch(`/api/supplier/categories?id=${categoryId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                showNotification("Category deleted!", "success");
                fetchSupplierCategories();
            } else {
                const data = await res.json();
                showNotification(data.error || "Failed to delete", "error");
            }
        } catch (error) {
            showNotification("Failed to delete category", "error");
        }
    };

    const handleQuoteSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/quotes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inquiryId: selectedInquiry.id,
                    price: quoteForm.price,
                    moq: quoteForm.moq,
                    timeline: quoteForm.timeline,
                    notes: quoteForm.notes
                }),
            });
            const data = await res.json();

            if (res.ok) {
                showNotification("Quote submitted successfully!", "success");
                setSelectedInquiry(null);
                setQuoteForm({ price: "", moq: "", timeline: "", notes: "" });
                fetchDashboardData(); // Refresh data
            } else {
                showNotification(data.error || "Failed to submit quote", "error");
            }
        } catch (error) {
            console.error("Failed to submit quote", error);
            showNotification("Failed to submit quote", "error");
        }
    };

    // Profile Edit Handlers
    const handleEditProfile = () => {
        setProfileForm({
            companyName: supplierProfile.companyName || "",
            email: supplierProfile.email || "",
            phone: supplierProfile.phone || "",
            gstNumber: supplierProfile.gstNumber || "",
            address: supplierProfile.address || "",
            city: supplierProfile.city || "",
            state: supplierProfile.state || "",
            pincode: supplierProfile.pincode || "",
            website: supplierProfile.website || "",
            description: supplierProfile.description || "",
            categories: supplierProfile.categories || "",
            capacity: supplierProfile.capacity || "",
            establishedYear: supplierProfile.establishedYear || "",
            employeeCount: supplierProfile.employeeCount || "",
            certifications: supplierProfile.certifications || ""
        });
        setProfileImagePreview(supplierProfile.profileImage || null);
        setIsEditingProfile(true);
    };

    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Show preview immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload to server
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("type", "profile");

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    setProfileImagePreview(data.url); // Replace with actual URL
                } else {
                    console.error("Failed to upload profile image");
                    showNotification("Failed to upload profile image", "error");
                }
            } catch (error) {
                console.error("Upload error:", error);
                showNotification("Failed to upload profile image", "error");
            }
        }
    };

    const handleProfileSave = async () => {
        setProfileSaving(true);
        try {
            const res = await fetch("/api/supplier/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...profileForm,
                    profileImage: profileImagePreview
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setSupplierProfile(data.supplier);
                setIsEditingProfile(false);
                showNotification("Profile updated successfully!", "success");
            } else {
                showNotification(data.error || "Failed to update profile", "error");
            }
        } catch (err) {
            console.error("Error updating profile", err);
            showNotification("Failed to update profile", "error");
        } finally {
            setProfileSaving(false);
        }
    };

    // Product Handlers
    const handleProductImageChange = async (e) => {
        const files = Array.from(e.target.files);

        // Show previews immediately
        const newPreviews = [];
        for (const file of files) {
            const reader = new FileReader();
            const preview = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
            newPreviews.push(preview);
        }
        setProductImagePreviews([...productImagePreviews, ...newPreviews]);

        // Upload all files to server
        try {
            const formData = new FormData();
            files.forEach(file => formData.append("files", file));
            formData.append("type", "products");

            const res = await fetch("/api/upload", {
                method: "PUT",
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                const uploadedUrls = data.uploaded.map(f => f.url);
                // Replace previews with actual URLs
                setProductImagePreviews(prev => {
                    const startIndex = prev.length - files.length;
                    return [...prev.slice(0, startIndex), ...uploadedUrls];
                });
                setProductForm({
                    ...productForm,
                    images: [...productForm.images, ...uploadedUrls]
                });
            } else {
                console.error("Failed to upload product images");
                showNotification("Failed to upload product images", "error");
            }
        } catch (error) {
            console.error("Upload error:", error);
            showNotification("Failed to upload product images", "error");
        }
    };

    const removeProductImage = (index) => {
        const newPreviews = productImagePreviews.filter((_, i) => i !== index);
        const newImages = productForm.images.filter((_, i) => i !== index);
        setProductImagePreviews(newPreviews);
        setProductForm({ ...productForm, images: newImages });
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setProductSaving(true);

        const isEditing = !!productForm.id;

        try {
            const res = await fetch("/api/supplier/products", {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productForm),
            });
            const data = await res.json();

            if (res.ok) {
                showNotification(isEditing ? "Product updated successfully!" : "Product added successfully!", "success");
                setShowAddProductModal(false);
                setProductForm({
                    name: "",
                    category: "",
                    description: "",
                    priceRange: "",
                    moq: "",
                    leadTime: "",
                    images: []
                });
                setProductImagePreviews([]);
                fetchDashboardData();
            } else {
                showNotification(data.error || `Failed to ${isEditing ? "update" : "add"} product`, "error");
            }
        } catch (error) {
            console.error(`Failed to ${isEditing ? "update" : "add"} product`, error);
            showNotification(`Failed to ${isEditing ? "update" : "add"} product`, "error");
        } finally {
            setProductSaving(false);
        }
    };

    const handleEditProduct = (product) => {
        setProductForm({
            id: product.id,
            name: product.name || "",
            category: product.category || "",
            description: product.description || "",
            priceRange: product.priceRange || "",
            moq: product.moq || "",
            leadTime: product.leadTime || "",
            images: product.images || []
        });
        setProductImagePreviews(product.images || []);
        setShowAddProductModal(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm("Are you sure you want to delete this product?")) {
            return;
        }

        try {
            const res = await fetch(`/api/supplier/products?id=${productId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                showNotification("Product deleted successfully!", "success");
                fetchDashboardData();
            } else {
                const data = await res.json();
                showNotification(data.error || "Failed to delete product", "error");
            }
        } catch (error) {
            console.error("Failed to delete product", error);
            showNotification("Failed to delete product", "error");
        }
    };

    // Get current analytics data based on selected period
    const getCurrentAnalytics = () => {
        switch (analyticsPeriod) {
            case "sixMonths":
                return analyticsData.sixMonths;
            case "yearly":
                return analyticsData.yearly;
            default:
                return analyticsData.monthly;
        }
    };

    const currentAnalytics = getCurrentAnalytics();
    const maxValue = Math.max(...currentAnalytics.inquiries);

    if (loading) {
        return <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading...</div>;
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            fontFamily: "'Inter', system-ui, sans-serif",
            backgroundColor: "#f8fafc"
        }}>
            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: "fixed",
                    top: "24px",
                    right: "24px",
                    padding: "16px 24px",
                    backgroundColor: notification.type === "success" ? "#10b981" : "#ef4444",
                    color: "white",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 9999,
                    animation: "fadeIn 0.3s ease-out",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontWeight: "500"
                }}>
                    <span>{notification.type === "success" ? "✅" : "⚠️"}</span>
                    {notification.message}
                </div>
            )}

            {/* Sidebar - Hidden on Mobile */}
            {!isMobile && (
                <aside style={{
                    width: "260px",
                    backgroundColor: "#0f172a",
                    padding: "24px 16px",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0
                }}>
                    <Link href="/supplier" style={{ textDecoration: "none", display: "block", marginBottom: "40px" }}>
                        <span style={{ fontSize: "20px", fontWeight: "bold", color: "white" }}>
                            Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                        </span>
                        <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Supplier Portal</span>
                    </Link>

                    <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {[
                            { id: "inquiries", label: "Inquiries", icon: "📥" },
                            { id: "dealsWon", label: "Deals Won", icon: "🤝" },
                            { id: "analytics", label: "Analytics", icon: "📊" },
                            { id: "profile", label: "Company Profile", icon: "🏢" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px 16px",
                                    backgroundColor: activeTab === item.id ? "#1e293b" : "transparent",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: activeTab === item.id ? "white" : "#94a3b8",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    textAlign: "left"
                                }}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}

                        {/* Products/Categories Tab */}
                        <button
                            onClick={() => setActiveTab("productsCat")}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                backgroundColor: activeTab === "productsCat" ? "#1e293b" : "transparent",
                                border: "none",
                                borderRadius: "8px",
                                color: activeTab === "productsCat" ? "white" : "#94a3b8",
                                fontSize: "14px",
                                cursor: "pointer",
                                textAlign: "left"
                            }}
                        >
                            <span>📦</span>
                            Products/Categories
                        </button>
                    </nav>

                    {/* Badges */}
                    <div style={{ marginTop: "40px", padding: "16px", backgroundColor: "#1e293b", borderRadius: "12px" }}>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>YOUR BADGES</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {supplierProfile.badges && supplierProfile.badges.map((badge, i) => (
                                <span key={i} style={{ padding: "4px 10px", backgroundColor: "#3b82f6", color: "white", borderRadius: "12px", fontSize: "11px" }}>
                                    {badge}
                                </span>
                            ))}
                            {(!supplierProfile.badges || supplierProfile.badges.length === 0) && (
                                <span style={{ color: "#64748b", fontSize: "11px" }}>No badges yet</span>
                            )}
                        </div>
                    </div>

                    <div style={{ position: "absolute", bottom: "24px", left: "16px", right: "16px" }}>
                        <Link href="/" style={{
                            display: "block",
                            padding: "12px",
                            backgroundColor: "#1e293b",
                            borderRadius: "8px",
                            color: "#94a3b8",
                            textDecoration: "none",
                            fontSize: "14px",
                            textAlign: "center"
                        }}>
                            ← Back to Main Site
                        </Link>
                    </div>
                </aside>
            )}

            {/* Mobile Header */}
            {isMobile && (
                <>
                    <header style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: "#0f172a",
                        padding: "12px 16px",
                        zIndex: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <Link href="/supplier" style={{ textDecoration: "none" }}>
                            <span style={{ fontSize: "18px", fontWeight: "bold", color: "white" }}>
                                Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                            </span>
                        </Link>
                        <Link href="/" style={{
                            padding: "6px 12px",
                            backgroundColor: "#1e293b",
                            borderRadius: "6px",
                            color: "#94a3b8",
                            textDecoration: "none",
                            fontSize: "12px"
                        }}>
                            ← Home
                        </Link>
                    </header>
                    {/* Mobile Tab Bar */}
                    <div style={{
                        position: "fixed",
                        top: "48px",
                        left: 0,
                        right: 0,
                        backgroundColor: "white",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        overflowX: "auto",
                        zIndex: 49
                    }}>
                        {[
                            { id: "inquiries", label: "Inquiries" },
                            { id: "dealsWon", label: "Deals Won" },
                            { id: "analytics", label: "Stats" },
                            { id: "profile", label: "Profile" },
                            { id: "productsCat", label: "Products" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                style={{
                                    padding: "12px 16px",
                                    fontSize: "13px",
                                    fontWeight: activeTab === item.id ? "600" : "400",
                                    color: activeTab === item.id ? "#3b82f6" : "#64748b",
                                    backgroundColor: "transparent",
                                    border: "none",
                                    borderBottom: activeTab === item.id ? "2px solid #3b82f6" : "2px solid transparent",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Main Content */}
            <main style={{ marginLeft: isMobile ? 0 : "260px", flex: 1, padding: isMobile ? "100px 16px 16px" : "24px" }}>
                {/* Header */}
                <header style={{ marginBottom: isMobile ? "16px" : "32px" }}>
                    <h1 style={{ fontSize: isMobile ? "20px" : "24px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                        Welcome, {supplierProfile.companyName || "Supplier"}
                    </h1>
                    <p style={{ color: "#64748b", fontSize: isMobile ? "13px" : "14px" }}>Manage your inquiries, quotes, and business profile</p>
                </header>

                {/* Mobile Badges */}
                {isMobile && (
                    <div style={{
                        backgroundColor: "white",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        marginBottom: "16px"
                    }}>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", fontWeight: "500" }}>YOUR BADGES</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {supplierProfile.badges && supplierProfile.badges.map((badge, i) => (
                                <span key={i} style={{ padding: "4px 10px", backgroundColor: "#3b82f6", color: "white", borderRadius: "12px", fontSize: "11px", fontWeight: "500" }}>
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                {activeTab === "inquiries" && (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
                        {[
                            { label: "Total Inquiries", value: stats.totalInquiries, color: "#3b82f6" },
                            { label: "Quotes Submitted", value: stats.quotesSubmitted, color: "#8b5cf6" },
                            { label: "Deals Won", value: stats.acceptedDeals, color: "#22c55e" },
                            { label: "Conversion Rate", value: `${stats.conversionRate}%`, color: "#f59e0b" }
                        ].map((stat, i) => (
                            <div key={i} style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <div style={{ fontSize: "28px", fontWeight: "bold", color: stat.color, marginBottom: "4px" }}>{stat.value}</div>
                                <div style={{ fontSize: "13px", color: "#64748b" }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Inquiries Tab */}
                {activeTab === "inquiries" && (
                    <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                        <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>Active Inquiries</h2>
                            <p style={{ fontSize: "13px", color: "#64748b" }}>AI-validated buyer inquiries matching your products</p>
                        </div>

                        <div>
                            {inquiries.length === 0 && (
                                <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>No active inquiries found.</div>
                            )}
                            {inquiries.map((inquiry) => (
                                <div
                                    key={inquiry.id}
                                    style={{
                                        padding: "20px",
                                        borderBottom: "1px solid #f1f5f9",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                                            <h3 style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "600", color: "#0f172a" }}>{inquiry.product}</h3>
                                            <span style={{
                                                padding: "2px 8px",
                                                borderRadius: "10px",
                                                fontSize: "11px",
                                                backgroundColor: inquiry.status === "new" ? "#dcfce7" : inquiry.status === "quoted" ? "#fef3c7" : "#dbeafe",
                                                color: inquiry.status === "new" ? "#15803d" : inquiry.status === "quoted" ? "#b45309" : "#1d4ed8"
                                            }}>
                                                {inquiry.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", gap: isMobile ? "12px" : "24px", fontSize: "13px", color: "#64748b", flexWrap: "wrap" }}>
                                            <span>Qty: {inquiry.quantity}</span>
                                            <span>Budget: {inquiry.budget}</span>
                                            {!isMobile && <span>Timeline: {inquiry.timeline}</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        {inquiry.status === "new" && (
                                            <button
                                                onClick={() => setSelectedInquiry(inquiry)}
                                                style={{
                                                    padding: "8px 16px",
                                                    backgroundColor: "#0f172a",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    fontSize: "13px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Submit Quote
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Deals Won Tab */}
                {activeTab === "dealsWon" && (
                    <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                        <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>🤝 Deals Won</h2>
                            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Buyers who contacted you via chat requesting your details</p>
                        </div>
                        <div>
                            {/* Filter inquiries where buyer contacted via chat for supplier details */}
                            {inquiries.filter(inq => inq.status === "contacted" || inq.requiresContact).length === 0 && (
                                <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎯</div>
                                    <div style={{ fontWeight: "500", marginBottom: "4px" }}>No deals won yet</div>
                                    <div style={{ fontSize: "13px" }}>When buyers ask for your contact details in chat, they'll appear here</div>
                                </div>
                            )}
                            {inquiries.filter(inq => inq.status === "contacted" || inq.requiresContact).map((deal) => (
                                <div key={deal.id} style={{
                                    padding: "20px",
                                    borderBottom: "1px solid #f1f5f9",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    flexWrap: "wrap",
                                    gap: "16px"
                                }}>
                                    <div style={{ flex: 1, minWidth: "200px" }}>
                                        <div style={{ fontWeight: "600", fontSize: "15px", color: "#0f172a", marginBottom: "6px" }}>
                                            {deal.buyerName || deal.buyer?.name || "Anonymous Buyer"}
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                                            📧 {deal.buyerEmail || deal.buyer?.email || "No email provided"}
                                        </div>
                                        {deal.buyerPhone && (
                                            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                                                📱 {deal.buyerPhone}
                                            </div>
                                        )}
                                        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
                                            Product: {deal.productName || deal.category || "General Inquiry"}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                                            Qty: {deal.quantity} | Budget: {deal.budget}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                        <a
                                            href={`mailto:${deal.buyerEmail || deal.buyer?.email}?subject=Regarding your inquiry on ChidiyaAI&body=Hi ${deal.buyerName || "there"},\n\nThank you for your interest in our products. I'm reaching out regarding your inquiry.\n\nBest regards,\n${supplierProfile.companyName || "Supplier"}`}
                                            style={{
                                                padding: "8px 16px",
                                                backgroundColor: "#3b82f6",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                textDecoration: "none",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}
                                        >
                                            ✉️ Send Email
                                        </a>
                                        <button
                                            onClick={() => {
                                                const poc = `POC Created:\nBuyer: ${deal.buyerName || 'N/A'}\nEmail: ${deal.buyerEmail || 'N/A'}\nPhone: ${deal.buyerPhone || 'N/A'}\nProduct: ${deal.productName || deal.category || 'N/A'}\nQuantity: ${deal.quantity}\nBudget: ${deal.budget}`;
                                                navigator.clipboard.writeText(poc);
                                                showNotification("POC copied to clipboard!", "success");
                                            }}
                                            style={{
                                                padding: "8px 16px",
                                                backgroundColor: "#22c55e",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}
                                        >
                                            📋 Create POC
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === "analytics" && (
                    <div>
                        {/* Time Period Selector */}
                        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                            {[
                                { id: "monthly", label: "Last Month" },
                                { id: "sixMonths", label: "Last 6 Months" },
                                { id: "yearly", label: "Last Year" }
                            ].map((period) => (
                                <button
                                    key={period.id}
                                    onClick={() => setAnalyticsPeriod(period.id)}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: analyticsPeriod === period.id ? "#0f172a" : "white",
                                        color: analyticsPeriod === period.id ? "white" : "#64748b",
                                        border: analyticsPeriod === period.id ? "none" : "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>

                        {/* Summary Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#3b82f6", marginBottom: "4px" }}>
                                    {currentAnalytics.inquiries.reduce((a, b) => a + b, 0)}
                                </div>
                                <div style={{ fontSize: "13px", color: "#64748b" }}>Total Inquiries</div>
                            </div>
                            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#8b5cf6", marginBottom: "4px" }}>
                                    {currentAnalytics.quotes.reduce((a, b) => a + b, 0)}
                                </div>
                                <div style={{ fontSize: "13px", color: "#64748b" }}>Quotes Sent</div>
                            </div>
                            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#22c55e", marginBottom: "4px" }}>
                                    {currentAnalytics.deals.reduce((a, b) => a + b, 0)}
                                </div>
                                <div style={{ fontSize: "13px", color: "#64748b" }}>Deals Closed</div>
                            </div>
                            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#f59e0b", marginBottom: "4px" }}>
                                    {Math.round((currentAnalytics.deals.reduce((a, b) => a + b, 0) / currentAnalytics.quotes.reduce((a, b) => a + b, 0)) * 100) || 0}%
                                </div>
                                <div style={{ fontSize: "13px", color: "#64748b" }}>Conversion Rate</div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                            {/* Bar Chart - Inquiries Trend */}
                            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", marginBottom: "20px" }}>Inquiries Trend</h3>
                                <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "180px" }}>
                                    {currentAnalytics.inquiries.map((value, index) => (
                                        <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <div
                                                style={{
                                                    width: "100%",
                                                    backgroundColor: "#3b82f6",
                                                    borderRadius: "4px 4px 0 0",
                                                    height: `${(value / maxValue) * 140}px`,
                                                    transition: "height 0.3s",
                                                    minHeight: "4px"
                                                }}
                                            />
                                            <span style={{ fontSize: "10px", color: "#64748b", marginTop: "8px", textAlign: "center" }}>
                                                {currentAnalytics.labels[index]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Performance Overview */}
                            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", marginBottom: "20px" }}>Performance Overview</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ color: "#64748b" }}>Profile Views</span>
                                            <span style={{ fontWeight: "600" }}>{stats.profileViews}</span>
                                        </div>
                                        <div style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px" }}>
                                            <div style={{ width: `${Math.min(stats.profileViews / 2, 100)}%`, height: "100%", backgroundColor: "#3b82f6", borderRadius: "4px" }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ color: "#64748b" }}>Lead Acceptance Rate</span>
                                            <span style={{ fontWeight: "600" }}>{stats.leadAcceptRate}%</span>
                                        </div>
                                        <div style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px" }}>
                                            <div style={{ width: `${stats.leadAcceptRate}%`, height: "100%", backgroundColor: "#22c55e", borderRadius: "4px" }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ color: "#64748b" }}>Buyer Selection Rate</span>
                                            <span style={{ fontWeight: "600" }}>{stats.conversionRate}%</span>
                                        </div>
                                        <div style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px" }}>
                                            <div style={{ width: `${stats.conversionRate}%`, height: "100%", backgroundColor: "#f59e0b", borderRadius: "4px" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quotes vs Deals Chart */}
                            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", gridColumn: isMobile ? "1" : "1 / -1" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", marginBottom: "20px" }}>Quotes vs Deals Comparison</h3>
                                <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "180px" }}>
                                    {currentAnalytics.labels.map((label, index) => (
                                        <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: "140px" }}>
                                                <div
                                                    style={{
                                                        width: "16px",
                                                        backgroundColor: "#8b5cf6",
                                                        borderRadius: "3px 3px 0 0",
                                                        height: `${(currentAnalytics.quotes[index] / Math.max(...currentAnalytics.quotes)) * 140}px`,
                                                        minHeight: "4px"
                                                    }}
                                                    title={`Quotes: ${currentAnalytics.quotes[index]}`}
                                                />
                                                <div
                                                    style={{
                                                        width: "16px",
                                                        backgroundColor: "#22c55e",
                                                        borderRadius: "3px 3px 0 0",
                                                        height: `${(currentAnalytics.deals[index] / Math.max(...currentAnalytics.quotes)) * 140}px`,
                                                        minHeight: "4px"
                                                    }}
                                                    title={`Deals: ${currentAnalytics.deals[index]}`}
                                                />
                                            </div>
                                            <span style={{ fontSize: "10px", color: "#64748b", marginTop: "8px" }}>{label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ width: "12px", height: "12px", backgroundColor: "#8b5cf6", borderRadius: "2px" }} />
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>Quotes</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ width: "12px", height: "12px", backgroundColor: "#22c55e", borderRadius: "2px" }} />
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>Deals</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div style={{ backgroundColor: "white", padding: isMobile ? "20px" : "32px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                        {/* Header with Edit Button */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h2 style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "600", color: "#0f172a" }}>Company Profile</h2>
                            <button
                                onClick={handleEditProfile}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#0f172a",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}
                            >
                                ✏️ Edit Profile
                            </button>
                        </div>

                        {/* Profile Image */}
                        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px", flexWrap: "wrap" }}>
                            <div style={{
                                width: "120px",
                                height: "120px",
                                borderRadius: "16px",
                                backgroundColor: "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                border: "2px solid #e2e8f0"
                            }}>
                                {supplierProfile.profileImage ? (
                                    <img
                                        src={supplierProfile.profileImage}
                                        alt="Company Logo"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <span style={{ fontSize: "48px" }}>🏢</span>
                                )}
                            </div>
                            <div>
                                <h3 style={{ fontSize: "24px", fontWeight: "600", color: "#0f172a", marginBottom: "4px" }}>
                                    {supplierProfile.companyName || "Company Name"}
                                </h3>
                                <p style={{ color: "#64748b", fontSize: "14px" }}>{supplierProfile.email}</p>
                                {supplierProfile.badges && supplierProfile.badges.length > 0 && (
                                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                        {supplierProfile.badges.map((badge, i) => (
                                            <span key={i} style={{
                                                padding: "4px 10px",
                                                backgroundColor: badge.includes("GST") ? "#22c55e" : "#3b82f6",
                                                color: "white",
                                                borderRadius: "12px",
                                                fontSize: "11px",
                                                fontWeight: "500"
                                            }}>
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Details Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Company Name</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.companyName || "—"}</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.email || "—"}</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Phone</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.phone || "—"}</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>GST Number</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.gstNumber || "—"}</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Address</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.address || "—"}</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>City</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.city || "—"}</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>State</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.state || "—"}</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pincode</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.pincode || "—"}</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Website</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>
                                    {supplierProfile.website ? (
                                        <a href={supplierProfile.website} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>
                                            {supplierProfile.website}
                                        </a>
                                    ) : "—"}
                                </p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Capacity</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.capacity || "—"}</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Established Year</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.establishedYear || "—"}</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Employee Count</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.employeeCount || "—"}</p>
                            </div>
                            <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Categories</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.categories || "—"}</p>
                            </div>
                            <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Certifications</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>{supplierProfile.certifications || "—"}</p>
                            </div>
                            <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Description</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a", lineHeight: "1.6" }}>{supplierProfile.description || "—"}</p>
                            </div>
                        </div>

                        {/* Verification Documents */}
                        {supplierProfile.documents && supplierProfile.documents.length > 0 && (
                            <div style={{ marginTop: "32px", padding: "24px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", marginBottom: "16px" }}>Verification Documents</h3>
                                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "16px" }}>
                                    {supplierProfile.documents.map((doc) => (
                                        <div key={doc.id} style={{
                                            padding: "16px",
                                            backgroundColor: "white",
                                            borderRadius: "8px",
                                            border: "1px solid #e2e8f0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                {doc.fileUrl ? (
                                                    <div style={{ width: "40px", height: "40px", borderRadius: "4px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                                                        <img src={doc.fileUrl} alt={doc.fileName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: "24px" }}>📄</span>
                                                )}
                                                <div>
                                                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#0f172a" }}>{doc.fileName}</div>
                                                    <div style={{ fontSize: "12px", color: doc.status === "verified" ? "#22c55e" : "#f59e0b" }}>
                                                        {doc.status === "pending" ? "SUBMITTED" : doc.status.toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                            {doc.fileUrl && (
                                                <a
                                                    href={doc.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        fontSize: "13px",
                                                        color: "#3b82f6",
                                                        textDecoration: "none",
                                                        padding: "6px 12px",
                                                        backgroundColor: "#eff6ff",
                                                        borderRadius: "6px"
                                                    }}
                                                >
                                                    View
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Products/Categories Tab */}
                {activeTab === "productsCat" && (
                    <div>
                        {/* Sub-Navigation */}
                        <div style={{
                            display: "flex",
                            gap: "8px",
                            marginBottom: "24px",
                            flexWrap: "wrap",
                            backgroundColor: "white",
                            padding: "12px",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0"
                        }}>
                            {[
                                { id: "addProduct", label: "➕ Add Product" },
                                { id: "manageProducts", label: "📦 Manage Products" },
                                { id: "addCategory", label: "📂 Add Category" },
                                { id: "manageCategories", label: "⚙️ Manage Categories" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setProductCategorySubTab(item.id)}
                                    style={{
                                        padding: "10px 16px",
                                        backgroundColor: productCategorySubTab === item.id ? "#0f172a" : "#f1f5f9",
                                        color: productCategorySubTab === item.id ? "white" : "#0f172a",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        cursor: "pointer"
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Add Product Sub-Tab */}
                        {productCategorySubTab === "addProduct" && (
                            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "20px" }}>
                                    Add New Product
                                </h2>

                                {/* Step Indicator */}
                                <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                                    <div style={{
                                        padding: "8px 16px",
                                        backgroundColor: addProductStep === 1 ? "#0f172a" : "#e2e8f0",
                                        color: addProductStep === 1 ? "white" : "#64748b",
                                        borderRadius: "20px",
                                        fontSize: "13px",
                                        fontWeight: "500"
                                    }}>1. Basic Details</div>
                                    <div style={{
                                        padding: "8px 16px",
                                        backgroundColor: addProductStep === 2 ? "#0f172a" : "#e2e8f0",
                                        color: addProductStep === 2 ? "white" : "#64748b",
                                        borderRadius: "20px",
                                        fontSize: "13px",
                                        fontWeight: "500"
                                    }}>2. Specifications</div>
                                </div>

                                {/* Step 1: Basic Details */}
                                {addProductStep === 1 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {/* Category Selection */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "8px" }}>
                                                Select Category *
                                            </label>
                                            <select
                                                value={addProductForm.supplierCategoryId}
                                                onChange={(e) => {
                                                    const cat = supplierCategories.find(c => c.id === e.target.value);
                                                    setAddProductForm({
                                                        ...addProductForm,
                                                        supplierCategoryId: e.target.value,
                                                        categoryTemplateId: cat?.categoryTemplateId || ""
                                                    });
                                                    setSelectedCategoryForProduct(cat?.categoryTemplate || null);
                                                }}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "8px",
                                                    fontSize: "14px",
                                                    color: "#0f172a"
                                                }}
                                            >
                                                <option value="">Choose a category...</option>
                                                {supplierCategories.filter(c => c.status === "approved").map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.categoryTemplate?.name || "Unknown"}
                                                    </option>
                                                ))}
                                            </select>
                                            {supplierCategories.filter(c => c.status === "approved").length === 0 && (
                                                <p style={{ fontSize: "12px", color: "#f59e0b", marginTop: "8px" }}>
                                                    ⚠️ No approved categories. Add a category first!
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "8px" }}>
                                                Product Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={addProductForm.name}
                                                onChange={(e) => setAddProductForm({ ...addProductForm, name: e.target.value })}
                                                placeholder="e.g., 3 Ply Corrugated Box"
                                                style={{
                                                    width: "100%",
                                                    padding: "12px",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "8px",
                                                    fontSize: "14px",
                                                    color: "#0f172a",
                                                    backgroundColor: "#ffffff"
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "8px" }}>
                                                Description *
                                            </label>
                                            <textarea
                                                value={addProductForm.description}
                                                onChange={(e) => setAddProductForm({ ...addProductForm, description: e.target.value })}
                                                placeholder="Describe your product, features, materials, etc."
                                                rows={4}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "8px",
                                                    fontSize: "14px",
                                                    color: "#0f172a",
                                                    backgroundColor: "#ffffff",
                                                    resize: "vertical"
                                                }}
                                            />
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                            <div>
                                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "8px" }}>
                                                    Price *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={addProductForm.price}
                                                    onChange={(e) => setAddProductForm({ ...addProductForm, price: e.target.value })}
                                                    placeholder="e.g., ₹25-50"
                                                    style={{
                                                        width: "100%",
                                                        padding: "12px",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "8px",
                                                        fontSize: "14px",
                                                        color: "#0f172a",
                                                        backgroundColor: "#ffffff"
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "8px" }}>
                                                    Price Unit
                                                </label>
                                                <select
                                                    value={addProductForm.priceUnit.startsWith("Other:") ? "Other" : addProductForm.priceUnit}
                                                    onChange={(e) => setAddProductForm({ ...addProductForm, priceUnit: e.target.value })}
                                                    style={{
                                                        width: "100%",
                                                        padding: "12px",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "8px",
                                                        fontSize: "14px",
                                                        color: "#0f172a",
                                                        backgroundColor: "#ffffff"
                                                    }}
                                                >
                                                    <option value="Piece">Per Piece</option>
                                                    <option value="Box">Per Box</option>
                                                    <option value="Kg">Per Kg</option>
                                                    <option value="Meter">Per Meter</option>
                                                    <option value="Pack">Per Pack</option>
                                                    <option value="Dozen">Per Dozen</option>
                                                    <option value="Liter">Per Liter</option>
                                                    <option value="Other">Other (Specify)</option>
                                                </select>
                                                {(addProductForm.priceUnit === "Other" || addProductForm.priceUnit.startsWith("Other:")) && (
                                                    <input
                                                        type="text"
                                                        placeholder="Specify your price unit..."
                                                        value={addProductForm.priceUnit.startsWith("Other:") ? addProductForm.priceUnit.replace("Other:", "") : ""}
                                                        onChange={(e) => setAddProductForm({ ...addProductForm, priceUnit: `Other:${e.target.value}` })}
                                                        style={{
                                                            width: "100%",
                                                            padding: "12px",
                                                            border: "1px solid #e2e8f0",
                                                            borderRadius: "8px",
                                                            fontSize: "14px",
                                                            color: "#0f172a",
                                                            backgroundColor: "#ffffff",
                                                            marginTop: "8px"
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (!addProductForm.supplierCategoryId) {
                                                    showNotification("Please select a category", "error");
                                                    return;
                                                }
                                                if (!addProductForm.name || !addProductForm.description) {
                                                    showNotification("Please fill in all required fields", "error");
                                                    return;
                                                }
                                                setAddProductStep(2);
                                            }}
                                            style={{
                                                alignSelf: "flex-end",
                                                padding: "12px 24px",
                                                backgroundColor: "#3b82f6",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Next: Specifications →
                                        </button>
                                    </div>
                                )}

                                {/* Step 2: Specifications */}
                                {addProductStep === 2 && selectedCategoryForProduct && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <button
                                            onClick={() => setAddProductStep(1)}
                                            style={{
                                                alignSelf: "flex-start",
                                                padding: "8px 16px",
                                                backgroundColor: "#f1f5f9",
                                                color: "#0f172a",
                                                border: "none",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            ← Back to Basic Details
                                        </button>

                                        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>
                                            Specifications for {selectedCategoryForProduct.name}
                                        </h3>

                                        {/* Dynamic Specs from Category Template */}
                                        {selectedCategoryForProduct.specifications &&
                                            Object.entries(selectedCategoryForProduct.specifications).map(([specKey, specData]) => (
                                                <div key={specKey}>
                                                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "8px" }}>
                                                        {specKey} {specData.required && "*"}
                                                    </label>
                                                    {specData.type === "select" ? (
                                                        <div>
                                                            <select
                                                                value={addProductForm.specifications[specKey] || ""}
                                                                onChange={(e) => setAddProductForm({
                                                                    ...addProductForm,
                                                                    specifications: {
                                                                        ...addProductForm.specifications,
                                                                        [specKey]: e.target.value
                                                                    }
                                                                })}
                                                                style={{
                                                                    width: "100%",
                                                                    padding: "12px",
                                                                    border: "1px solid #e2e8f0",
                                                                    borderRadius: "8px",
                                                                    fontSize: "14px",
                                                                    color: "#0f172a",
                                                                    backgroundColor: "#ffffff"
                                                                }}
                                                            >
                                                                <option value="">Select...</option>
                                                                {specData.options?.map(opt => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                                <option value="Other">Other (Specify)</option>
                                                            </select>
                                                            {addProductForm.specifications[specKey] === "Other" && (
                                                                <input
                                                                    type="text"
                                                                    placeholder={`Specify ${specKey}...`}
                                                                    value={addProductForm.otherSpecs[specKey] || ""}
                                                                    onChange={(e) => setAddProductForm({
                                                                        ...addProductForm,
                                                                        otherSpecs: {
                                                                            ...addProductForm.otherSpecs,
                                                                            [specKey]: e.target.value
                                                                        }
                                                                    })}
                                                                    style={{
                                                                        width: "100%",
                                                                        padding: "12px",
                                                                        border: "1px solid #e2e8f0",
                                                                        borderRadius: "8px",
                                                                        fontSize: "14px",
                                                                        color: "#0f172a",
                                                                        backgroundColor: "#ffffff",
                                                                        marginTop: "8px"
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    ) : specData.type === "multiselect" ? (
                                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                            {specData.options?.map(opt => (
                                                                <label key={opt} style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px",
                                                                    padding: "8px 12px",
                                                                    backgroundColor: (addProductForm.specifications[specKey] || []).includes(opt) ? "#dbeafe" : "#f1f5f9",
                                                                    borderRadius: "6px",
                                                                    cursor: "pointer",
                                                                    fontSize: "13px"
                                                                }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={(addProductForm.specifications[specKey] || []).includes(opt)}
                                                                        onChange={(e) => {
                                                                            const current = addProductForm.specifications[specKey] || [];
                                                                            setAddProductForm({
                                                                                ...addProductForm,
                                                                                specifications: {
                                                                                    ...addProductForm.specifications,
                                                                                    [specKey]: e.target.checked
                                                                                        ? [...current, opt]
                                                                                        : current.filter(v => v !== opt)
                                                                                }
                                                                            });
                                                                        }}
                                                                    />
                                                                    {opt}
                                                                </label>
                                                            ))}
                                                            <label style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "8px",
                                                                padding: "8px 12px",
                                                                backgroundColor: (addProductForm.specifications[specKey] || []).includes("Other") ? "#dbeafe" : "#f1f5f9",
                                                                borderRadius: "6px",
                                                                cursor: "pointer",
                                                                fontSize: "13px"
                                                            }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(addProductForm.specifications[specKey] || []).includes("Other")}
                                                                    onChange={(e) => {
                                                                        const current = addProductForm.specifications[specKey] || [];
                                                                        setAddProductForm({
                                                                            ...addProductForm,
                                                                            specifications: {
                                                                                ...addProductForm.specifications,
                                                                                [specKey]: e.target.checked
                                                                                    ? [...current, "Other"]
                                                                                    : current.filter(v => v !== "Other")
                                                                            }
                                                                        });
                                                                    }}
                                                                />
                                                                Other
                                                            </label>
                                                            {(addProductForm.specifications[specKey] || []).includes("Other") && (
                                                                <input
                                                                    type="text"
                                                                    placeholder={`Specify other ${specKey}...`}
                                                                    value={addProductForm.otherSpecs[specKey] || ""}
                                                                    onChange={(e) => setAddProductForm({
                                                                        ...addProductForm,
                                                                        otherSpecs: {
                                                                            ...addProductForm.otherSpecs,
                                                                            [specKey]: e.target.value
                                                                        }
                                                                    })}
                                                                    style={{
                                                                        width: "100%",
                                                                        padding: "12px",
                                                                        border: "1px solid #e2e8f0",
                                                                        borderRadius: "8px",
                                                                        fontSize: "14px",
                                                                        color: "#0f172a",
                                                                        backgroundColor: "#ffffff",
                                                                        marginTop: "8px"
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={addProductForm.specifications[specKey] || ""}
                                                            onChange={(e) => setAddProductForm({
                                                                ...addProductForm,
                                                                specifications: {
                                                                    ...addProductForm.specifications,
                                                                    [specKey]: e.target.value
                                                                }
                                                            })}
                                                            placeholder={`Enter ${specKey}...`}
                                                            style={{
                                                                width: "100%",
                                                                padding: "12px",
                                                                border: "1px solid #e2e8f0",
                                                                borderRadius: "8px",
                                                                fontSize: "14px",
                                                                color: "#0f172a",
                                                                backgroundColor: "#ffffff"
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            ))}

                                        {/* Additional Info - Free Text */}
                                        <div style={{
                                            backgroundColor: "#f8fafc",
                                            padding: "16px",
                                            borderRadius: "12px",
                                            border: "1px dashed #e2e8f0"
                                        }}>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "8px" }}>
                                                💡 Additional Information (Optional)
                                            </label>
                                            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                                                Add common Indian names, local terms, additional details about your product that buyers might search for.
                                            </p>
                                            <textarea
                                                value={addProductForm.additionalInfo}
                                                onChange={(e) => setAddProductForm({ ...addProductForm, additionalInfo: e.target.value })}
                                                placeholder="e.g., Also known as: Packaging Dabba, Karton Box, Brown Box. Available in custom prints..."
                                                rows={3}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "8px",
                                                    fontSize: "14px",
                                                    color: "#0f172a",
                                                    backgroundColor: "#ffffff",
                                                    resize: "vertical"
                                                }}
                                            />
                                        </div>

                                        <button
                                            onClick={async () => {
                                                setProductSaving(true);
                                                try {
                                                    const finalSpecs = { ...addProductForm.specifications };
                                                    Object.entries(addProductForm.otherSpecs).forEach(([key, val]) => {
                                                        if (val && finalSpecs[key] === "Other") {
                                                            finalSpecs[key] = val;
                                                        } else if (val && Array.isArray(finalSpecs[key]) && finalSpecs[key].includes("Other")) {
                                                            finalSpecs[key] = finalSpecs[key].filter(v => v !== "Other").concat([val]);
                                                        }
                                                    });
                                                    if (addProductForm.additionalInfo) {
                                                        finalSpecs.additionalInfo = addProductForm.additionalInfo;
                                                    }

                                                    const res = await fetch("/api/supplier/products", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            name: addProductForm.name,
                                                            description: addProductForm.description,
                                                            price: addProductForm.price,
                                                            priceUnit: addProductForm.priceUnit,
                                                            supplierCategoryId: addProductForm.supplierCategoryId,
                                                            categoryTemplateId: addProductForm.categoryTemplateId,
                                                            specifications: finalSpecs,
                                                            images: addProductForm.images
                                                        })
                                                    });
                                                    const data = await res.json();
                                                    if (res.ok) {
                                                        showNotification("Product added successfully!", "success");
                                                        setAddProductForm({
                                                            name: "", description: "", price: "", priceUnit: "Piece",
                                                            supplierCategoryId: "", categoryTemplateId: "",
                                                            images: [], specifications: {}, otherSpecs: {}, additionalInfo: ""
                                                        });
                                                        setAddProductStep(1);
                                                        setSelectedCategoryForProduct(null);
                                                        fetchDashboardData();
                                                    } else {
                                                        showNotification(data.error || "Failed to add product", "error");
                                                    }
                                                } catch (error) {
                                                    showNotification("Failed to add product", "error");
                                                } finally {
                                                    setProductSaving(false);
                                                }
                                            }}
                                            disabled={productSaving}
                                            style={{
                                                alignSelf: "flex-end",
                                                padding: "12px 32px",
                                                backgroundColor: productSaving ? "#94a3b8" : "#22c55e",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                cursor: productSaving ? "not-allowed" : "pointer"
                                            }}
                                        >
                                            {productSaving ? "Saving..." : "✅ Add Product"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Manage Products Sub-Tab */}
                        {productCategorySubTab === "manageProducts" && (
                            <div>
                                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "20px" }}>
                                    {products.length === 0 ? (
                                        <div style={{
                                            gridColumn: "1 / -1",
                                            backgroundColor: "white",
                                            padding: "60px 40px",
                                            borderRadius: "16px",
                                            border: "2px dashed #e2e8f0",
                                            textAlign: "center"
                                        }}>
                                            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
                                            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>No Products Yet</h3>
                                            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>Add your first product to showcase to buyers</p>
                                            <button
                                                onClick={() => setProductCategorySubTab("addProduct")}
                                                style={{
                                                    padding: "12px 24px",
                                                    backgroundColor: "#3b82f6",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    fontSize: "14px",
                                                    fontWeight: "500",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Add Your First Product
                                            </button>
                                        </div>
                                    ) : (
                                        products.map((product) => (
                                            <div key={product.id} style={{
                                                backgroundColor: "white",
                                                borderRadius: "12px",
                                                border: "1px solid #e2e8f0",
                                                overflow: "hidden"
                                            }}>
                                                <div style={{
                                                    height: "160px",
                                                    backgroundColor: "#f1f5f9",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                }}>
                                                    {product.images && product.images[0] ? (
                                                        <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    ) : (
                                                        <span style={{ fontSize: "40px" }}>📦</span>
                                                    )}
                                                </div>
                                                <div style={{ padding: "16px" }}>
                                                    <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", marginBottom: "4px" }}>{product.name}</h4>
                                                    <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>{product.category}</p>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "12px" }}>
                                                        <span style={{ color: "#64748b" }}>MOQ: {product.moq}</span>
                                                        <span style={{ fontWeight: "600", color: "#22c55e" }}>{product.priceRange || product.price}</span>
                                                    </div>
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button
                                                            onClick={() => handleEditProduct(product)}
                                                            style={{
                                                                flex: 1,
                                                                padding: "8px",
                                                                backgroundColor: "#f1f5f9",
                                                                color: "#0f172a",
                                                                border: "none",
                                                                borderRadius: "6px",
                                                                fontSize: "12px",
                                                                fontWeight: "500",
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                gap: "4px"
                                                            }}
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            style={{
                                                                flex: 1,
                                                                padding: "8px",
                                                                backgroundColor: "#fef2f2",
                                                                color: "#dc2626",
                                                                border: "none",
                                                                borderRadius: "6px",
                                                                fontSize: "12px",
                                                                fontWeight: "500",
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                gap: "4px"
                                                            }}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Add Category Sub-Tab */}
                        {productCategorySubTab === "addCategory" && (
                            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "20px" }}>
                                    Request New Category
                                </h2>

                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "8px" }}>
                                            Select Category *
                                        </label>
                                        <select
                                            value={categoryForm.categoryId}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, categoryId: e.target.value, customCategoryName: e.target.value === "other" ? categoryForm.customCategoryName : "" })}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "8px",
                                                fontSize: "14px",
                                                color: "#0f172a",
                                                backgroundColor: "#ffffff"
                                            }}
                                        >
                                            <option value="">Choose a category...</option>
                                            {categoryTemplates.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                            <option value="other">🆕 Other (Request New Category)</option>
                                        </select>
                                        {categoryForm.categoryId === "other" && (
                                            <input
                                                type="text"
                                                placeholder="Enter your category name (e.g., Plastic Containers, Jute Bags...)"
                                                value={categoryForm.customCategoryName}
                                                onChange={(e) => setCategoryForm({ ...categoryForm, customCategoryName: e.target.value })}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "8px",
                                                    fontSize: "14px",
                                                    color: "#0f172a",
                                                    backgroundColor: "#ffffff",
                                                    marginTop: "8px"
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "8px" }}>
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={categoryForm.description}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                            placeholder="Describe what products you'll add in this category..."
                                            rows={3}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "8px",
                                                fontSize: "14px",
                                                color: "#0f172a",
                                                backgroundColor: "#ffffff",
                                                resize: "vertical"
                                            }}
                                        />
                                    </div>

                                    <p style={{ fontSize: "12px", color: "#f59e0b" }}>
                                        ⚠️ New category requests require admin approval. You'll be notified once approved.
                                    </p>

                                    <button
                                        onClick={handleRequestCategory}
                                        disabled={categorySaving}
                                        style={{
                                            alignSelf: "flex-start",
                                            padding: "12px 24px",
                                            backgroundColor: categorySaving ? "#94a3b8" : "#3b82f6",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            cursor: categorySaving ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        {categorySaving ? "Requesting..." : "Request Category"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Manage Categories Sub-Tab */}
                        {productCategorySubTab === "manageCategories" && (
                            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "20px" }}>
                                    Your Categories
                                </h2>

                                {supplierCategories.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📂</div>
                                        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>No Categories Yet</h3>
                                        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>Request your first category to start adding products</p>
                                        <button
                                            onClick={() => setProductCategorySubTab("addCategory")}
                                            style={{
                                                padding: "12px 24px",
                                                backgroundColor: "#3b82f6",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Add Your First Category
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {supplierCategories.map((cat) => (
                                            <div key={cat.id} style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "16px",
                                                backgroundColor: "#f8fafc",
                                                borderRadius: "12px",
                                                border: "1px solid #e2e8f0"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <span style={{ fontSize: "24px" }}>📦</span>
                                                    <div>
                                                        <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                                                            {cat.categoryTemplate?.name || "Unknown Category"}
                                                        </h4>
                                                        <span style={{
                                                            display: "inline-block",
                                                            marginTop: "4px",
                                                            padding: "2px 8px",
                                                            fontSize: "11px",
                                                            fontWeight: "500",
                                                            borderRadius: "12px",
                                                            backgroundColor: cat.status === "approved" ? "#dcfce7" : cat.status === "pending" ? "#fef3c7" : "#fef2f2",
                                                            color: cat.status === "approved" ? "#15803d" : cat.status === "pending" ? "#b45309" : "#dc2626"
                                                        }}>
                                                            {cat.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    style={{
                                                        padding: "8px 16px",
                                                        backgroundColor: "#fef2f2",
                                                        color: "#dc2626",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        fontSize: "12px",
                                                        fontWeight: "500",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
                }
            </main >

            {/* Quote Modal */}
            {
                selectedInquiry && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100
                    }}>
                        <div style={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            padding: "32px",
                            width: "100%",
                            maxWidth: "500px"
                        }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                                Submit Quote
                            </h2>
                            <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
                                For: {selectedInquiry.product}
                            </p>

                            <form onSubmit={handleQuoteSubmit}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Price (₹)</label>
                                        <input
                                            type="text"
                                            value={quoteForm.price}
                                            onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                                            placeholder="e.g., 2,25,000"
                                            required
                                            style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>MOQ</label>
                                        <input
                                            type="text"
                                            value={quoteForm.moq}
                                            onChange={(e) => setQuoteForm({ ...quoteForm, moq: e.target.value })}
                                            placeholder="e.g., 500 meters"
                                            required
                                            style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Delivery Timeline</label>
                                        <input
                                            type="text"
                                            value={quoteForm.timeline}
                                            onChange={(e) => setQuoteForm({ ...quoteForm, timeline: e.target.value })}
                                            placeholder="e.g., 20 days"
                                            required
                                            style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Notes (Optional)</label>
                                        <textarea
                                            value={quoteForm.notes}
                                            onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                                            placeholder="Any additional details..."
                                            rows={3}
                                            style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box", resize: "vertical" }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedInquiry(null)}
                                        style={{ flex: 1, padding: "12px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer" }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ flex: 1, padding: "12px", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
                                    >
                                        Submit Quote
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Profile Edit Modal */}
            {
                isEditingProfile && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        padding: "20px",
                        overflowY: "auto"
                    }}>
                        <div style={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            padding: "32px",
                            width: "100%",
                            maxWidth: "700px",
                            maxHeight: "90vh",
                            overflowY: "auto"
                        }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "24px" }}>
                                Edit Company Profile
                            </h2>

                            {/* Profile Image Upload */}
                            <div style={{ marginBottom: "24px", textAlign: "center" }}>
                                <div style={{
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "16px",
                                    backgroundColor: "#f1f5f9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    border: "2px solid #e2e8f0",
                                    margin: "0 auto 12px"
                                }}>
                                    {profileImagePreview ? (
                                        <img src={profileImagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{ fontSize: "36px" }}>🏢</span>
                                    )}
                                </div>
                                <label style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#f1f5f9",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    color: "#64748b"
                                }}>
                                    📷 Upload Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfileImageChange}
                                        style={{ display: "none" }}
                                    />
                                </label>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Company Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.companyName}
                                        onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Email</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Phone</label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>GST Number</label>
                                    <input
                                        type="text"
                                        value={profileForm.gstNumber}
                                        onChange={(e) => setProfileForm({ ...profileForm, gstNumber: e.target.value })}
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Address</label>
                                    <input
                                        type="text"
                                        value={profileForm.address}
                                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>City</label>
                                    <input
                                        type="text"
                                        value={profileForm.city}
                                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>State</label>
                                    <input
                                        type="text"
                                        value={profileForm.state}
                                        onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Pincode</label>
                                    <input
                                        type="text"
                                        value={profileForm.pincode}
                                        onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Website</label>
                                    <input
                                        type="url"
                                        value={profileForm.website}
                                        onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                                        placeholder="https://"
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Capacity</label>
                                    <input
                                        type="text"
                                        value={profileForm.capacity}
                                        onChange={(e) => setProfileForm({ ...profileForm, capacity: e.target.value })}
                                        placeholder="e.g., 10000 units/month"
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Established Year</label>
                                    <input
                                        type="text"
                                        value={profileForm.establishedYear}
                                        onChange={(e) => setProfileForm({ ...profileForm, establishedYear: e.target.value })}
                                        placeholder="e.g., 2010"
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Employee Count</label>
                                    <input
                                        type="text"
                                        value={profileForm.employeeCount}
                                        onChange={(e) => setProfileForm({ ...profileForm, employeeCount: e.target.value })}
                                        placeholder="e.g., 50-100"
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Categories</label>
                                    <input
                                        type="text"
                                        value={profileForm.categories}
                                        onChange={(e) => setProfileForm({ ...profileForm, categories: e.target.value })}
                                        placeholder="e.g., Textiles, Fabrics, Cotton"
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Certifications</label>
                                    <input
                                        type="text"
                                        value={profileForm.certifications}
                                        onChange={(e) => setProfileForm({ ...profileForm, certifications: e.target.value })}
                                        placeholder="e.g., ISO 9001, GOTS Certified"
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Description</label>
                                    <textarea
                                        value={profileForm.description}
                                        onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                                        placeholder="Tell buyers about your company..."
                                        rows={4}
                                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box", resize: "vertical" }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingProfile(false)}
                                    style={{ flex: 1, padding: "12px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleProfileSave}
                                    disabled={profileSaving}
                                    style={{
                                        flex: 1,
                                        padding: "12px",
                                        backgroundColor: profileSaving ? "#94a3b8" : "#0f172a",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: profileSaving ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {profileSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add Product Modal */}
            {
                showAddProductModal && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        padding: "20px",
                        overflowY: "auto"
                    }}>
                        <div style={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            padding: "32px",
                            width: "100%",
                            maxWidth: "600px",
                            maxHeight: "90vh",
                            overflowY: "auto"
                        }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                                {productForm.id ? "Edit Product" : "Add New Product"}
                            </h2>
                            <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
                                {productForm.id ? "Update your product details" : "Add details about your product for buyers to see"}
                            </p>

                            <form onSubmit={handleAddProduct}>
                                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                                    {/* Left Column */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#0f172a" }}>Product Name *</label>
                                            <input
                                                type="text"
                                                value={productForm.name}
                                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                                placeholder="e.g., Paper Cup, Corrugated Box"
                                                required
                                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box", color: "#0f172a", backgroundColor: "white", fontSize: "14px" }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#0f172a" }}>Category *</label>
                                            <select
                                                value={productForm.category}
                                                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                                required
                                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box", color: "#0f172a", backgroundColor: "white", fontSize: "14px" }}
                                            >
                                                <option value="">Select Category</option>
                                                {categoryOptions.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#0f172a" }}>Local/Common Name (Optional)</label>
                                            <input
                                                type="text"
                                                value={productForm.localName}
                                                onChange={(e) => setProductForm({ ...productForm, localName: e.target.value })}
                                                placeholder='e.g., "dhafti ka dibba", "gatta box"'
                                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box", color: "#0f172a", backgroundColor: "white", fontSize: "14px" }}
                                            />
                                        </div>

                                        {/* Material Checkboxes */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#0f172a" }}>Material</label>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                                {materialOptions.map(mat => (
                                                    <label key={mat} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#475569", cursor: "pointer" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={productForm.materials?.includes(mat)}
                                                            onChange={(e) => {
                                                                const mats = productForm.materials || [];
                                                                setProductForm({
                                                                    ...productForm,
                                                                    materials: e.target.checked ? [...mats, mat] : mats.filter(m => m !== mat)
                                                                });
                                                            }}
                                                        />
                                                        {mat}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Usage Checkboxes */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#0f172a" }}>Usage</label>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                                {usageOptions.map(use => (
                                                    <label key={use} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#475569", cursor: "pointer" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={productForm.usage?.includes(use)}
                                                            onChange={(e) => {
                                                                const uses = productForm.usage || [];
                                                                setProductForm({
                                                                    ...productForm,
                                                                    usage: e.target.checked ? [...uses, use] : uses.filter(u => u !== use)
                                                                });
                                                            }}
                                                        />
                                                        {use}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Strength Checkboxes */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#0f172a" }}>Strength</label>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                                {strengthOptions.map(str => (
                                                    <label key={str} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#475569", cursor: "pointer" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={productForm.strength?.includes(str)}
                                                            onChange={(e) => {
                                                                const strs = productForm.strength || [];
                                                                setProductForm({
                                                                    ...productForm,
                                                                    strength: e.target.checked ? [...strs, str] : strs.filter(s => s !== str)
                                                                });
                                                            }}
                                                        />
                                                        {str}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {/* Price Range */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#0f172a" }}>Price Range *</label>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                                                <input
                                                    type="number"
                                                    value={productForm.minPrice}
                                                    onChange={(e) => setProductForm({ ...productForm, minPrice: e.target.value })}
                                                    placeholder="Min ₹"
                                                    required
                                                    style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box", color: "#0f172a", backgroundColor: "white", fontSize: "14px" }}
                                                />
                                                <input
                                                    type="number"
                                                    value={productForm.maxPrice}
                                                    onChange={(e) => setProductForm({ ...productForm, maxPrice: e.target.value })}
                                                    placeholder="Max ₹"
                                                    required
                                                    style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box", color: "#0f172a", backgroundColor: "white", fontSize: "14px" }}
                                                />
                                                <select
                                                    value={productForm.priceUnit}
                                                    onChange={(e) => setProductForm({ ...productForm, priceUnit: e.target.value })}
                                                    style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box", color: "#0f172a", backgroundColor: "white", fontSize: "14px" }}
                                                >
                                                    {priceUnitOptions.map(unit => (
                                                        <option key={unit} value={unit}>per {unit}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* MOQ */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#0f172a" }}>Minimum Order Quantity (MOQ) *</label>
                                            <input
                                                type="number"
                                                value={productForm.moq}
                                                onChange={(e) => setProductForm({ ...productForm, moq: e.target.value })}
                                                placeholder="e.g., 500"
                                                required
                                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box", color: "#0f172a", backgroundColor: "white", fontSize: "14px" }}
                                            />
                                            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Unit auto-linked from price unit: {productForm.priceUnit}</p>
                                        </div>

                                        {/* Lead Time */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#0f172a" }}>Lead Time</label>
                                            <select
                                                value={productForm.leadTime}
                                                onChange={(e) => setProductForm({ ...productForm, leadTime: e.target.value })}
                                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box", color: "#0f172a", backgroundColor: "white", fontSize: "14px" }}
                                            >
                                                {leadTimeOptions.map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#0f172a" }}>Description</label>
                                            <textarea
                                                value={productForm.description}
                                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                                placeholder="Describe your product features, quality, and specifications..."
                                                rows={3}
                                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box", resize: "vertical", color: "#0f172a", backgroundColor: "white", fontSize: "14px" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Product Images Upload */}
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Product Images</label>
                                    <div style={{
                                        border: "2px dashed #e2e8f0",
                                        borderRadius: "12px",
                                        padding: "20px",
                                        textAlign: "center",
                                        backgroundColor: "#f8fafc"
                                    }}>
                                        <div style={{ marginBottom: "12px" }}>
                                            <span style={{ fontSize: "32px" }}>📷</span>
                                        </div>
                                        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
                                            Upload product images (JPG, PNG)
                                        </p>
                                        <label style={{
                                            display: "inline-block",
                                            padding: "10px 20px",
                                            backgroundColor: "#0f172a",
                                            color: "white",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            fontWeight: "500",
                                            cursor: "pointer"
                                        }}>
                                            Choose Images
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleProductImageChange}
                                                style={{ display: "none" }}
                                            />
                                        </label>
                                    </div>

                                    {/* Image Previews */}
                                    {productImagePreviews.length > 0 && (
                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(4, 1fr)",
                                            gap: "12px",
                                            marginTop: "16px"
                                        }}>
                                            {productImagePreviews.map((preview, index) => (
                                                <div key={index} style={{ position: "relative" }}>
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        style={{
                                                            width: "100%",
                                                            height: "80px",
                                                            objectFit: "cover",
                                                            borderRadius: "8px",
                                                            border: "1px solid #e2e8f0"
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProductImage(index)}
                                                        style={{
                                                            position: "absolute",
                                                            top: "-8px",
                                                            right: "-8px",
                                                            width: "24px",
                                                            height: "24px",
                                                            borderRadius: "50%",
                                                            backgroundColor: "#ef4444",
                                                            color: "white",
                                                            border: "none",
                                                            fontSize: "14px",
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center"
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddProductModal(false);
                                            setProductForm({
                                                name: "",
                                                localName: "",
                                                category: "",
                                                description: "",
                                                minPrice: "",
                                                maxPrice: "",
                                                priceUnit: "piece",
                                                moq: "",
                                                leadTime: "7-10 days",
                                                materials: [],
                                                usage: [],
                                                strength: [],
                                                images: []
                                            });
                                            setProductImagePreviews([]);
                                        }}
                                        style={{ flex: 1, padding: "12px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer" }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={productSaving}
                                        style={{
                                            flex: 1,
                                            padding: "12px",
                                            backgroundColor: productSaving ? "#94a3b8" : "#0f172a",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: productSaving ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        {productSaving ? "Saving..." : (productForm.id ? "Update Product" : "Add Product")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div >
                )
            }
        </div >
    );
}
