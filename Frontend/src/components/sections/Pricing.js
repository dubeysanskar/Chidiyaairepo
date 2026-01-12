import Button from "../ui/Button";

const plans = [
    {
        name: "Starter",
        price: "Free",
        description: "For small businesses",
        features: ["10 searches/month", "Basic matching", "Email support"],
        cta: "Get Started",
        href: "/auth/signup",
    },
    {
        name: "Professional",
        price: "₹2,999",
        period: "/mo",
        description: "For growing businesses",
        features: ["Unlimited searches", "Advanced AI", "Priority support", "Verification reports"],
        cta: "Start Trial",
        href: "/auth/signup?plan=pro",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For large organizations",
        features: ["Everything in Pro", "Dedicated manager", "API access", "Custom integrations"],
        cta: "Contact Sales",
        href: "/contact",
    },
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-20 bg-white">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">
                        Simple pricing
                    </h2>
                    <p className="text-slate-600">
                        Start free, upgrade when you need.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl p-6 ${plan.popular
                                    ? "bg-slate-900 text-white ring-2 ring-blue-500"
                                    : "bg-white border border-slate-200"
                                }`}
                        >
                            {plan.popular && (
                                <span className="inline-block px-3 py-1 mb-4 bg-blue-500 text-white text-xs font-medium rounded-full">
                                    Popular
                                </span>
                            )}

                            <div className="mb-4">
                                <h3 className={`text-lg font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <span className={`text-3xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>
                                    {plan.price}
                                </span>
                                {plan.period && (
                                    <span className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                                        {plan.period}
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <svg className={`w-4 h-4 flex-shrink-0 ${plan.popular ? "text-blue-400" : "text-green-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className={plan.popular ? "text-slate-300" : "text-slate-600"}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                href={plan.href}
                                variant={plan.popular ? "secondary" : "outline"}
                                className="w-full justify-center"
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
