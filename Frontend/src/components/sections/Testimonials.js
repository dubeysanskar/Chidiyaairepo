const testimonials = [
    {
        quote: "ChidiyaAI changed how we source suppliers. We get matches in minutes now.",
        author: "Rajesh K.",
        role: "Procurement, TechFab",
    },
    {
        quote: "The verified network saved us from scam orders. Trust factor is invaluable.",
        author: "Priya S.",
        role: "Owner, Sharma Textiles",
    },
    {
        quote: "Chidi understands exactly what we need. It's like having an expert 24/7.",
        author: "Amit P.",
        role: "Sourcing, Green Earth",
    },
];

export default function Testimonials() {
    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">
                        Trusted by businesses
                    </h2>
                    <p className="text-slate-600">See what our customers say</p>
                </div>

                {/* Testimonials */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {testimonials.map((t, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                            <p className="text-slate-600 mb-6 leading-relaxed">"{t.quote}"</p>
                            <div>
                                <p className="font-semibold text-slate-900">{t.author}</p>
                                <p className="text-sm text-slate-500">{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 text-center pt-8 border-t border-slate-200">
                    <div>
                        <p className="text-3xl font-bold text-blue-600">10K+</p>
                        <p className="text-sm text-slate-500 mt-1">Suppliers</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-blue-600">50K+</p>
                        <p className="text-sm text-slate-500 mt-1">Matches</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-blue-600">98%</p>
                        <p className="text-sm text-slate-500 mt-1">Satisfaction</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
