import { Resend } from 'resend';

// Lazy initialization to avoid crash when API key is missing
let resend: Resend | null = null;

function getResend(): Resend | null {
    if (!resend && process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'ChidiyaAI <noreply@chidiyaai.com>';
const BASE_URL = process.env.NEXTAUTH_URL || 'https://chidiyaai.com';

// ============================================
// WELCOME EMAILS
// ============================================

export async function sendBuyerWelcomeEmail(email: string, name: string) {
    try {
        const client = getResend();
        if (!client) {
            console.warn('Resend API key not configured, skipping email');
            return { success: false, error: 'Email not configured' };
        }
        const { data, error } = await client.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Welcome to ChidiyaAI! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ChidiyaAI! 🎉</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px;">
                        <p style="font-size: 16px; color: #334155;">Hi ${name || 'there'},</p>
                        <p style="font-size: 16px; color: #334155;">Thank you for joining ChidiyaAI - India's AI-powered packaging marketplace!</p>
                        <p style="font-size: 16px; color: #334155;">You can now:</p>
                        <ul style="color: #334155;">
                            <li>🔍 Find verified packaging suppliers instantly</li>
                            <li>💬 Chat with our AI to get personalized recommendations</li>
                            <li>📞 Connect directly with suppliers</li>
                            <li>💰 Get the best quotes for your packaging needs</li>
                        </ul>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${BASE_URL}/chat" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Start Searching</a>
                        </div>
                        <p style="font-size: 14px; color: #64748b;">Need help? Reply to this email or visit our website.</p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('Failed to send buyer welcome email:', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Error sending buyer welcome email:', error);
        return { success: false, error };
    }
}

export async function sendSupplierWelcomeEmail(email: string, companyName: string) {
    try {
        const client = getResend();
        if (!client) {
            console.warn('Resend API key not configured, skipping email');
            return { success: false, error: 'Email not configured' };
        }
        const { data, error } = await client.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Welcome to ChidiyaAI Seller Platform! 🚀',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px;">
                    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome, ${companyName}! 🚀</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px;">
                        <p style="font-size: 16px; color: #334155;">Congratulations on joining ChidiyaAI!</p>
                        <p style="font-size: 16px; color: #334155;">Your account is under review. Once approved, you'll be able to:</p>
                        <ul style="color: #334155;">
                            <li>📦 List your packaging products</li>
                            <li>🔔 Receive buyer inquiries directly</li>
                            <li>⭐ Build your reputation with badges</li>
                            <li>📈 Grow your business with AI-matched leads</li>
                        </ul>
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #92400e; margin: 0; font-size: 14px;">⏳ <strong>Review Status:</strong> Your account is pending approval. We'll notify you once approved!</p>
                        </div>
                        <p style="font-size: 14px; color: #64748b;">Free for 6 months, then ₹2999/year for unlimited access.</p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('Failed to send supplier welcome email:', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Error sending supplier welcome email:', error);
        return { success: false, error };
    }
}

// ============================================
// PASSWORD RESET EMAILS
// ============================================

export async function sendPasswordResetEmail(email: string, resetToken: string, userType: 'buyer' | 'supplier' = 'buyer') {
    const resetPath = userType === 'supplier' ? 'supplier/reset-password' : 'account/reset-password';
    const resetLink = `${BASE_URL}/${resetPath}?token=${resetToken}&email=${encodeURIComponent(email)}`;

    try {
        const client = getResend();
        if (!client) {
            console.warn('Resend API key not configured, skipping email');
            return { success: false, error: 'Email not configured' };
        }
        const { data, error } = await client.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Reset Your ChidiyaAI Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px;">
                    <div style="background: #1e293b; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px;">
                        <p style="font-size: 16px; color: #334155;">We received a request to reset your password.</p>
                        <p style="font-size: 16px; color: #334155;">Click the button below to set a new password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
                        </div>
                        <p style="font-size: 14px; color: #64748b;">This link will expire in 1 hour.</p>
                        <p style="font-size: 14px; color: #64748b;">If you didn't request this, please ignore this email.</p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('Failed to send password reset email:', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error };
    }
}

export async function sendPasswordChangedEmail(email: string, name: string) {
    try {
        const client = getResend();
        if (!client) {
            console.warn('Resend API key not configured, skipping email');
            return { success: false, error: 'Email not configured' };
        }
        const { data, error } = await client.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Your ChidiyaAI Password Has Been Changed',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px;">
                    <div style="background: #10b981; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">✅ Password Changed Successfully</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px;">
                        <p style="font-size: 16px; color: #334155;">Hi ${name || 'there'},</p>
                        <p style="font-size: 16px; color: #334155;">Your ChidiyaAI password has been successfully changed.</p>
                        <p style="font-size: 14px; color: #64748b;">If you didn't make this change, please contact support immediately.</p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('Failed to send password changed email:', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Error sending password changed email:', error);
        return { success: false, error };
    }
}

// ============================================
// OTP VERIFICATION EMAIL
// ============================================

export async function sendOTPEmail(email: string, otp: string, name?: string) {
    try {
        const client = getResend();
        if (!client) {
            console.warn('Resend API key not configured, skipping email');
            return { success: false, error: 'Email not configured' };
        }
        const { data, error } = await client.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Verify Your Email - ChidiyaAI',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">📧 Verify Your Email</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; text-align: center;">
                        <p style="font-size: 16px; color: #334155;">Hi ${name || 'there'},</p>
                        <p style="font-size: 16px; color: #334155;">Your verification code is:</p>
                        <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3b82f6;">${otp}</span>
                        </div>
                        <p style="font-size: 14px; color: #64748b;">This code expires in 10 minutes.</p>
                        <p style="font-size: 14px; color: #64748b;">If you didn't request this, please ignore this email.</p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('Failed to send OTP email:', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error };
    }
}

// ============================================
// ADMIN ACTION EMAILS
// ============================================

export async function sendAdminActionEmail(
    email: string,
    name: string,
    action: 'approved' | 'suspended' | 'blocked' | 'unblocked' | 'badge_added' | 'badge_removed',
    userType: 'buyer' | 'supplier' = 'supplier',
    details?: string
) {
    const actionMessages = {
        approved: {
            subject: '🎉 Your ChidiyaAI Account is Approved!',
            title: 'Account Approved!',
            color: '#10b981',
            message: 'Congratulations! Your account has been verified and approved. You can now start receiving buyer inquiries.',
            cta: { text: 'Go to Dashboard', link: `${BASE_URL}/supplier/dashboard` }
        },
        suspended: {
            subject: '⚠️ Your ChidiyaAI Account Has Been Suspended',
            title: 'Account Suspended',
            color: '#f59e0b',
            message: `Your account has been temporarily suspended. ${details || 'Please contact support for more information.'}`,
            cta: null
        },
        blocked: {
            subject: '🚫 Your ChidiyaAI Account Has Been Blocked',
            title: 'Account Blocked',
            color: '#ef4444',
            message: `Your account has been blocked. ${details || 'Please contact support if you believe this is an error.'}`,
            cta: null
        },
        unblocked: {
            subject: '✅ Your ChidiyaAI Account Has Been Restored',
            title: 'Account Restored!',
            color: '#10b981',
            message: 'Your account has been restored. You can now continue using ChidiyaAI.',
            cta: { text: 'Go to Dashboard', link: `${BASE_URL}/${userType}/dashboard` }
        },
        badge_added: {
            subject: '⭐ You Earned a New Badge on ChidiyaAI!',
            title: 'New Badge Earned!',
            color: '#8b5cf6',
            message: `Congratulations! You've earned a new badge: ${details}. This badge will be displayed on your profile.`,
            cta: { text: 'View Profile', link: `${BASE_URL}/supplier/dashboard` }
        },
        badge_removed: {
            subject: 'Badge Removed from Your ChidiyaAI Profile',
            title: 'Badge Removed',
            color: '#64748b',
            message: `A badge has been removed from your profile: ${details}.`,
            cta: null
        }
    };

    const actionConfig = actionMessages[action];

    try {
        const client = getResend();
        if (!client) {
            console.warn('Resend API key not configured, skipping email');
            return { success: false, error: 'Email not configured' };
        }
        const { data, error } = await client.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: actionConfig.subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px;">
                    <div style="background: ${actionConfig.color}; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">${actionConfig.title}</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px;">
                        <p style="font-size: 16px; color: #334155;">Hi ${name || 'there'},</p>
                        <p style="font-size: 16px; color: #334155;">${actionConfig.message}</p>
                        ${actionConfig.cta ? `
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${actionConfig.cta.link}" style="background: ${actionConfig.color}; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">${actionConfig.cta.text}</a>
                            </div>
                        ` : ''}
                        <p style="font-size: 14px; color: #64748b;">Need help? Contact us at support@chidiyaai.com</p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('Failed to send admin action email:', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Error sending admin action email:', error);
        return { success: false, error };
    }
}

// ============================================
// SUPPLIER CARD EMAIL
// ============================================

interface SupplierInfo {
    companyName: string;
    city: string;
    productCategories: string[];
    badges: string[];
    phone?: string;
    description?: string;
}

export async function sendSupplierCardEmail(
    email: string,
    buyerName: string,
    suppliers: SupplierInfo[],
    searchQuery?: string
) {
    const supplierCards = suppliers.map(s => `
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 15px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; margin-right: 15px;">📦</div>
                <div>
                    <h3 style="margin: 0; color: #1e293b; font-size: 18px;">${s.companyName}</h3>
                    <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">📍 ${s.city}</p>
                </div>
            </div>
            <div style="margin: 10px 0;">
                ${s.badges.map(b => `<span style="background: #dbeafe; color: #1d4ed8; padding: 4px 10px; border-radius: 20px; font-size: 12px; margin-right: 5px;">${b}</span>`).join('')}
            </div>
            <p style="color: #475569; font-size: 14px; margin: 10px 0;">${s.description || 'Quality packaging solutions'}</p>
            <div style="background: #f1f5f9; padding: 10px; border-radius: 8px; margin-top: 10px;">
                <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Products:</strong> ${s.productCategories.join(', ')}</p>
            </div>
            ${s.phone ? `<p style="margin: 10px 0 0; color: #3b82f6; font-size: 14px;">📞 ${s.phone}</p>` : ''}
        </div>
    `).join('');

    try {
        const client = getResend();
        if (!client) {
            console.warn('Resend API key not configured, skipping email');
            return { success: false, error: 'Email not configured' };
        }
        const { data, error } = await client.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `Your Packaging Suppliers - ChidiyaAI Match Results`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">📦 Your Matched Suppliers</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px;">
                        <p style="font-size: 16px; color: #334155;">Hi ${buyerName || 'there'},</p>
                        <p style="font-size: 16px; color: #334155;">Based on your search${searchQuery ? ` for "${searchQuery}"` : ''}, here are your matched suppliers:</p>
                        ${supplierCards}
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${BASE_URL}/chat" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Find More Suppliers</a>
                        </div>
                        <p style="font-size: 14px; color: #64748b;">Need help? Reply to this email or contact support.</p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('Failed to send supplier card email:', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Error sending supplier card email:', error);
        return { success: false, error };
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateResetToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}
