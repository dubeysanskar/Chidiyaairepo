import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white py-12">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold">
                                Chidiya<span className="text-blue-400">AI</span>
                            </span>
                        </Link>
                        <p className="text-sm text-slate-400">
                            B2B sourcing made simple.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="#features" className="hover:text-white">Features</Link></li>
                            <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/about" className="hover:text-white">About</Link></li>
                            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                            <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} ChidiyaAI. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
