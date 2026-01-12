import Link from "next/link";

export default function CTA() {
    return (
        <section className="py-20 bg-slate-900">
            <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to find better suppliers?
                </h2>
                <p className="text-slate-400 mb-8">
                    Join thousands of businesses using ChidiyaAI. Start free today.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    <Link
                        href="/auth/signup"
                        className="px-8 py-3 bg-white text-slate-900 font-medium rounded-full hover:bg-slate-100 transition-colors"
                    >
                        Get Started Free
                    </Link>
                    <Link
                        href="/contact"
                        className="px-8 py-3 border border-slate-600 text-white font-medium rounded-full hover:bg-slate-800 transition-colors"
                    >
                        Talk to Sales
                    </Link>
                </div>
            </div>
        </section>
    );
}
