import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendSupplierWelcomeEmail, sendAdminNewSupplierNotification } from "../../../../lib/email";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export async function POST(req: Request) {
    try {
        const { action, ...data } = await req.json();

        // Register
        if (action === "register") {
            const {
                companyName,
                email,
                phone,
                password,
                location,
                categoryId,
                categoryDescription,
                // GST lookup fields (new)
                gstNumber,
                gstFetchStatus,
                gstLegalName,
                gstPrincipalPlace,
                gstApiStatus,
                gstRegisteredOn,
                gstConsentGiven,
                // Legacy fields (for backward compatibility)
                productCategories,
                capacity,
                moq,
                serviceLocations,
            } = data;

            console.log("Registration attempt for:", email);

            const existing = await prisma.supplier.findUnique({
                where: { email },
                select: { id: true },
            });

            if (existing) {
                return NextResponse.json(
                    { error: "Supplier already registered" },
                    { status: 400 }
                );
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("Password hashed");

            // Create supplier with GST lookup data
            let supplier;
            try {
                supplier = await prisma.supplier.create({
                    data: {
                        companyName,
                        email,
                        phone,
                        password: hashedPassword,
                        // Location
                        serviceLocations: location || serviceLocations || "",
                        // GST lookup data
                        gstNumber: gstNumber || null,
                        gstFetchStatus: gstFetchStatus || null,
                        gstLegalName: gstLegalName || null,
                        gstPrincipalPlace: gstPrincipalPlace || null,
                        gstApiStatus: gstApiStatus || null,
                        gstRegisteredOn: gstRegisteredOn || null,
                        gstConsentGiven: gstConsentGiven || false,
                        gstConsentAt: gstConsentGiven ? new Date() : null,
                        // Legacy fields
                        productCategories: Array.isArray(productCategories) ? productCategories : [],
                        capacity: capacity || null,
                        moq: moq || null,
                        description: categoryDescription || "",
                        status: "pending",
                        emailVerified: false,
                    },
                    select: {
                        id: true,
                    },
                });
                console.log("Supplier created:", supplier.id);
            } catch (createErr) {
                console.error("Error creating supplier:", createErr);
                return NextResponse.json(
                    { error: "Failed to create supplier account" },
                    { status: 500 }
                );
            }

            // If a category was selected, create a SupplierCategory record
            if (categoryId) {
                try {
                    await prisma.supplierCategory.create({
                        data: {
                            supplierId: supplier.id,
                            categoryTemplateId: categoryId,
                            customDescription: categoryDescription || "",
                            status: "approved",
                            isPrimary: true,
                        }
                    });
                    console.log("SupplierCategory created (mapped to template)");
                } catch (catError) {
                    console.error("Error creating supplier category:", catError);
                }
            } else if (Array.isArray(productCategories) && productCategories.length > 0) {
                // "Other" category — create SupplierCategory with customName for admin to map
                try {
                    await prisma.supplierCategory.create({
                        data: {
                            supplierId: supplier.id,
                            customName: productCategories[0],
                            customDescription: categoryDescription || "",
                            status: "pending",
                            isPrimary: true,
                        }
                    });
                    console.log("SupplierCategory created (custom/unmapped)");
                } catch (catError) {
                    console.error("Error creating custom supplier category:", catError);
                }
            }

            // Log GST lookup event if GST was fetched
            if (gstFetchStatus) {
                try {
                    await prisma.verificationEvent.create({
                        data: {
                            supplierId: supplier.id,
                            eventType: "gst_lookup",
                            payload: {
                                gstNumber,
                                gstFetchStatus,
                                gstLegalName,
                                gstPrincipalPlace,
                                gstApiStatus,
                            },
                        },
                    });
                } catch (eventErr) {
                    console.error("Error logging verification event:", eventErr);
                }
            }

            // Send welcome email to supplier (non-blocking)
            sendSupplierWelcomeEmail(email, companyName).catch(e => console.error("Welcome Email Error:", e));
            console.log("Welcome email queued");

            // Notify admins about new registration (non-blocking)
            sendAdminNewSupplierNotification(companyName, email, phone).catch(e => console.error("Admin Notification Error:", e));
            console.log("Admin notification queued");

            const token = jwt.sign(
                { id: supplier.id, type: "supplier" },
                JWT_SECRET,
                { expiresIn: "7d" }
            );
            console.log("Token generated");

            const response = NextResponse.json({
                success: true,
                supplierId: supplier.id,
            });

            response.cookies.delete("auth_token"); // Clear buyer session
            response.cookies.set("supplier_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60,
                path: "/",
            });

            console.log("Registration successful for:", email);
            return response;
        }


        // Login
        // Login
        if (action === "login") {
            const { email, password } = data;

            const supplier = await prisma.supplier.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    password: true,
                    status: true,
                },
            });

            if (!supplier || !(await bcrypt.compare(password, supplier.password))) {
                return NextResponse.json(
                    { error: "Invalid credentials" },
                    { status: 401 }
                );
            }

            // Allow pending suppliers to login — they'll see the pending page
            // Only block banned/suspended users
            if (supplier.status === "banned" || supplier.status === "suspended") {
                return NextResponse.json(
                    { error: "Account has been suspended. Contact support." },
                    { status: 403 }
                );
            }

            const token = jwt.sign(
                { id: supplier.id, type: "supplier" },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

            const response = NextResponse.json({ success: true });
            response.cookies.delete("auth_token"); // Clear buyer session
            response.cookies.set("supplier_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60,
                path: "/",
            });

            return response;
        }


        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Supplier Auth Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
