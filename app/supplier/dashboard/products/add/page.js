"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function AddProductContent() {
    const searchParams = useSearchParams();
    const preSelectedCategoryId = searchParams.get("categoryId");

    const [step, setStep] = useState(1);
    const [supplierCategories, setSupplierCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        priceUnit: "per Piece",
        images: [],
        specifications: {}
    });

    const priceUnits = [
        "per Piece", "per Pack", "per Kg", "per Meter", "per Sq.Meter",
        "per Liter", "per Dozen", "per Box", "per Roll", "per Set"
    ];

    // Fetch supplier's approved categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/supplier/categories");
                if (res.ok) {
                    const data = await res.json();
                    // Filter to only approved categories
                    const approved = (data.categories || []).filter(c => c.status === "approved");
                    setSupplierCategories(approved);

                    // Pre-select category if provided
                    if (preSelectedCategoryId) {
                        const preSelected = approved.find(c => c.id === preSelectedCategoryId);
                        if (preSelected) {
                            setSelectedCategory(preSelected);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, [preSelectedCategoryId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSpecChange = (key, value) => {
        setFormData({
            ...formData,
            specifications: {
                ...formData.specifications,
                [key]: value
            }
        });
    };

    const handleMultiSpecChange = (key, value, checked) => {
        const current = formData.specifications[key] || [];
        setFormData({
            ...formData,
            specifications: {
                ...formData.specifications,
                [key]: checked
                    ? [...current, value]
                    : current.filter(v => v !== value)
            }
        });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.images.length > 5) {
            setError("Maximum 5 images allowed");
            return;
        }

        // For now, just store file objects - in production, upload to cloud storage
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setFormData({
            ...formData,
            images: [...formData.images, ...newImages]
        });
        setError("");
    };

    const removeImage = (index) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            // Create FormData for image upload
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("description", formData.description);
            submitData.append("price", formData.price);
            submitData.append("priceUnit", formData.priceUnit);
            submitData.append("supplierCategoryId", selectedCategory.id);
            submitData.append("categoryTemplateId", selectedCategory.categoryTemplateId || "");
            submitData.append("specifications", JSON.stringify(formData.specifications));

            // Append images
            formData.images.forEach((img, i) => {
                if (img.file) {
                    submitData.append(`image_${i}`, img.file);
                }
            });

            const res = await fetch("/api/supplier/products", {
                method: "POST",
                body: submitData
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess("Product added successfully!");
                // Reset form
                setFormData({
                    name: "",
                    description: "",
                    price: "",
                    priceUnit: "per Piece",
                    images: [],
                    specifications: {}
                });
                setStep(1);
            } else {
                setError(data.error || "Failed to add product");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "12px",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "14px",
        boxSizing: "border-box",
        color: "#0f172a",
        backgroundColor: "white"
    };

    const labelStyle = {
        display: "block",
        fontSize: "14px",
        fontWeight: "500",
        color: "#0f172a",
        marginBottom: "6px"
    };

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8fafc"
            }}>
                <div style={{ color: "#64748b" }}>Loading...</div>
            </div>
        );
    }

    // Get specifications from selected category template
    const specifications = selectedCategory?.categoryTemplate?.specifications || [];

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            fontFamily: "'Inter', system-ui, sans-serif"
        }}>
            {/* Header */}
            <header style={{
                padding: "16px 24px",
                backgroundColor: "white",
                borderBottom: "1px solid #e2e8f0"
            }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
                    <Link href="/supplier/dashboard/categories" style={{
                        color: "#64748b",
                        textDecoration: "none",
                        fontSize: "14px"
                    }}>
                        ← Back
                    </Link>
                    <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a" }}>
                        Add New Product
                    </h1>
                </div>
            </header>

            {/* Progress Steps */}
            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "24px 24px 0",
                display: "flex",
                gap: "8px"
            }}>
                {[1, 2].map((s) => (
                    <div key={s} style={{ flex: 1 }}>
                        <div style={{
                            height: "4px",
                            backgroundColor: step >= s ? "#3b82f6" : "#e2e8f0",
                            borderRadius: "2px",
                            transition: "all 0.3s"
                        }} />
                        <p style={{
                            fontSize: "12px",
                            color: step >= s ? "#3b82f6" : "#94a3b8",
                            marginTop: "8px",
                            fontWeight: step === s ? "600" : "400"
                        }}>
                            {s === 1 ? "Basic Details" : "Specifications"}
                        </p>
                    </div>
                ))}
            </div>

            <main style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
                {/* Messages */}
                {success && (
                    <div style={{
                        padding: "16px",
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                        borderRadius: "8px",
                        marginBottom: "24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span>{success}</span>
                        <Link href="/supplier/dashboard/categories" style={{
                            color: "#166534",
                            fontWeight: "600",
                            textDecoration: "underline"
                        }}>
                            View Categories
                        </Link>
                    </div>
                )}
                {error && (
                    <div style={{
                        padding: "12px 16px",
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        borderRadius: "8px",
                        marginBottom: "24px",
                        fontSize: "14px"
                    }}>
                        {error}
                    </div>
                )}

                {/* No categories warning */}
                {supplierCategories.length === 0 && (
                    <div style={{
                        padding: "32px",
                        backgroundColor: "white",
                        borderRadius: "12px",
                        textAlign: "center"
                    }}>
                        <p style={{ fontSize: "16px", color: "#64748b", marginBottom: "16px" }}>
                            You don't have any approved categories yet.
                        </p>
                        <Link href="/supplier/dashboard/categories" style={{
                            padding: "10px 20px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "8px",
                            fontWeight: "600"
                        }}>
                            Request a Category
                        </Link>
                    </div>
                )}

                {/* Form */}
                {supplierCategories.length > 0 && (
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Basic Details */}
                        {step === 1 && (
                            <div style={{
                                backgroundColor: "white",
                                borderRadius: "12px",
                                padding: "32px"
                            }}>
                                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "24px" }}>
                                    Basic Details
                                </h2>

                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    {/* Category Selection */}
                                    <div>
                                        <label style={labelStyle}>Select Category *</label>
                                        <select
                                            value={selectedCategory?.id || ""}
                                            onChange={(e) => {
                                                const cat = supplierCategories.find(c => c.id === e.target.value);
                                                setSelectedCategory(cat || null);
                                            }}
                                            required
                                            style={{ ...inputStyle, cursor: "pointer" }}
                                        >
                                            <option value="">Choose a category</option>
                                            {supplierCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.categoryTemplate?.name || cat.customName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Product Name */}
                                    <div>
                                        <label style={labelStyle}>Product Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., 250ml Paper Cup - White"
                                            style={inputStyle}
                                        />
                                    </div>

                                    {/* Price */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                        <div>
                                            <label style={labelStyle}>Price (₹) *</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                required
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Unit *</label>
                                            <select
                                                name="priceUnit"
                                                value={formData.priceUnit}
                                                onChange={handleChange}
                                                style={{ ...inputStyle, cursor: "pointer" }}
                                            >
                                                {priceUnits.map(unit => (
                                                    <option key={unit} value={unit}>{unit}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label style={labelStyle}>Product Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe your product features, materials, benefits..."
                                            rows={4}
                                            style={{ ...inputStyle, resize: "vertical" }}
                                        />
                                    </div>

                                    {/* Images */}
                                    <div>
                                        <label style={labelStyle}>Product Images (Max 5)</label>
                                        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", marginTop: "-4px" }}>
                                            💡 Recommended: <strong>1:1 aspect ratio</strong> (square), <strong>800×800px</strong> minimum. Max 2MB per image.
                                        </p>
                                        <div style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "12px",
                                            marginTop: "8px"
                                        }}>
                                            {formData.images.map((img, i) => (
                                                <div key={i} style={{
                                                    width: "100px",
                                                    height: "100px",
                                                    borderRadius: "8px",
                                                    overflow: "hidden",
                                                    position: "relative",
                                                    border: "1px solid #e2e8f0"
                                                }}>
                                                    <img
                                                        src={img.preview}
                                                        alt={`Product ${i + 1}`}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover"
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(i)}
                                                        style={{
                                                            position: "absolute",
                                                            top: "4px",
                                                            right: "4px",
                                                            width: "24px",
                                                            height: "24px",
                                                            borderRadius: "50%",
                                                            backgroundColor: "rgba(0,0,0,0.6)",
                                                            color: "white",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            fontSize: "14px"
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            {formData.images.length < 5 && (
                                                <label style={{
                                                    width: "100px",
                                                    height: "100px",
                                                    borderRadius: "8px",
                                                    border: "2px dashed #e2e8f0",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                    color: "#94a3b8",
                                                    fontSize: "12px"
                                                }}>
                                                    <span style={{ fontSize: "24px", marginBottom: "4px" }}>+</span>
                                                    Add Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        style={{ display: "none" }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!selectedCategory || !formData.name || !formData.price}
                                    style={{
                                        marginTop: "32px",
                                        width: "100%",
                                        padding: "14px",
                                        backgroundColor: selectedCategory && formData.name && formData.price ? "#0f172a" : "#e2e8f0",
                                        color: selectedCategory && formData.name && formData.price ? "white" : "#94a3b8",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontWeight: "600",
                                        cursor: selectedCategory && formData.name && formData.price ? "pointer" : "not-allowed"
                                    }}
                                >
                                    Continue to Specifications →
                                </button>
                            </div>
                        )}

                        {/* Step 2: Specifications */}
                        {step === 2 && (
                            <div style={{
                                backgroundColor: "white",
                                borderRadius: "12px",
                                padding: "32px"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                                    <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>
                                        Specifications for {selectedCategory?.categoryTemplate?.name}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        style={{
                                            padding: "8px 16px",
                                            backgroundColor: "white",
                                            color: "#64748b",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "6px",
                                            fontSize: "13px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        ← Back
                                    </button>
                                </div>

                                {specifications.length === 0 ? (
                                    <p style={{ color: "#64748b", textAlign: "center", padding: "24px" }}>
                                        No specifications available for this category.
                                    </p>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                        {/* Important specs first */}
                                        {specifications.filter(s => s.important).map((spec) => (
                                            <SpecField
                                                key={spec.key}
                                                spec={spec}
                                                value={formData.specifications[spec.key]}
                                                onChange={handleSpecChange}
                                                onMultiChange={handleMultiSpecChange}
                                                isImportant={true}
                                            />
                                        ))}

                                        {/* Other specs */}
                                        {specifications.filter(s => !s.important).map((spec) => (
                                            <SpecField
                                                key={spec.key}
                                                spec={spec}
                                                value={formData.specifications[spec.key]}
                                                onChange={handleSpecChange}
                                                onMultiChange={handleMultiSpecChange}
                                                isImportant={false}
                                            />
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        marginTop: "32px",
                                        width: "100%",
                                        padding: "14px",
                                        backgroundColor: "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontWeight: "600",
                                        cursor: submitting ? "wait" : "pointer"
                                    }}
                                >
                                    {submitting ? "Adding Product..." : "Add Product"}
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </main>
        </div>
    );
}

// Specification field component
function SpecField({ spec, value, onChange, onMultiChange, isImportant }) {
    const labelStyle = {
        display: "block",
        fontSize: "14px",
        fontWeight: "500",
        color: "#0f172a",
        marginBottom: "8px"
    };

    if (spec.type === "multi") {
        return (
            <div>
                <label style={labelStyle}>
                    {spec.name}
                    {isImportant && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {spec.options.map(opt => (
                        <label
                            key={opt}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid",
                                borderColor: (value || []).includes(opt) ? "#3b82f6" : "#e2e8f0",
                                backgroundColor: (value || []).includes(opt) ? "#eff6ff" : "white",
                                cursor: "pointer",
                                fontSize: "13px",
                                color: (value || []).includes(opt) ? "#1d4ed8" : "#64748b",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={(value || []).includes(opt)}
                                onChange={(e) => onMultiChange(spec.key, opt, e.target.checked)}
                                style={{ display: "none" }}
                            />
                            {(value || []).includes(opt) && "✓"} {opt}
                        </label>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <label style={labelStyle}>
                {spec.name}
                {isImportant && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {spec.options.map(opt => (
                    <label
                        key={opt}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid",
                            borderColor: value === opt ? "#3b82f6" : "#e2e8f0",
                            backgroundColor: value === opt ? "#eff6ff" : "white",
                            cursor: "pointer",
                            fontSize: "13px",
                            color: value === opt ? "#1d4ed8" : "#64748b"
                        }}
                    >
                        <input
                            type="radio"
                            name={spec.key}
                            value={opt}
                            checked={value === opt}
                            onChange={(e) => onChange(spec.key, e.target.value)}
                            style={{ display: "none" }}
                        />
                        {opt}
                    </label>
                ))}
            </div>
        </div>
    );
}

export default function AddProductPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8fafc"
            }}>
                <div style={{ color: "#64748b" }}>Loading...</div>
            </div>
        }>
            <AddProductContent />
        </Suspense>
    );
}
