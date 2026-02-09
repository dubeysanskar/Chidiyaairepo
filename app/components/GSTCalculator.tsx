"use client";

import { useState } from "react";
import { Calculator, X, Percent, Info, ChevronDown, ChevronUp } from "lucide-react";

// Indian GST Slabs
const GST_SLABS = [
    { rate: 0, label: "0%", description: "Essential items, unbranded grains" },
    { rate: 5, label: "5%", description: "Packaged food, economy hotels" },
    { rate: 12, label: "12%", description: "Processed food, business class" },
    { rate: 18, label: "18%", description: "Most goods & services (default)" },
    { rate: 28, label: "28%", description: "Luxury items, cars, tobacco" },
];

interface GSTCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GSTCalculator({ isOpen, onClose }: GSTCalculatorProps) {
    const [quantity, setQuantity] = useState<string>("100");
    const [unitPrice, setUnitPrice] = useState<string>("10");
    const [gstRate, setGstRate] = useState<number>(18);
    const [customRate, setCustomRate] = useState<string>("");
    const [useCustomRate, setUseCustomRate] = useState(false);
    const [showSlabInfo, setShowSlabInfo] = useState(false);

    const calculateGST = () => {
        const qty = parseFloat(quantity) || 0;
        const price = parseFloat(unitPrice) || 0;
        const rate = useCustomRate ? (parseFloat(customRate) || 0) : gstRate;

        const baseAmount = qty * price;
        const gstAmount = (baseAmount * rate) / 100;
        const totalAmount = baseAmount + gstAmount;

        return { baseAmount, gstAmount, totalAmount, rate };
    };

    const { baseAmount, gstAmount, totalAmount, rate } = calculateGST();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">GST Calculator</h3>
                            <p className="text-xs text-white/80">Indian Tax Calculation</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Quantity & Price Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity
                            </label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="e.g., 1000"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unit Price (₹)
                            </label>
                            <input
                                type="number"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                                placeholder="e.g., 25"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                            />
                        </div>
                    </div>

                    {/* GST Slab Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                GST Slab
                            </label>
                            <button
                                onClick={() => setShowSlabInfo(!showSlabInfo)}
                                className="text-xs text-emerald-600 flex items-center gap-1 hover:underline"
                            >
                                <Info className="w-3 h-3" />
                                {showSlabInfo ? "Hide" : "Slab Info"}
                            </button>
                        </div>

                        {/* GST Slab Buttons */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {GST_SLABS.map((slab) => (
                                <button
                                    key={slab.rate}
                                    onClick={() => {
                                        setGstRate(slab.rate);
                                        setUseCustomRate(false);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${!useCustomRate && gstRate === slab.rate
                                            ? "bg-emerald-500 text-white shadow-md"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {slab.label}
                                </button>
                            ))}
                        </div>

                        {/* Slab Info Dropdown */}
                        {showSlabInfo && (
                            <div className="bg-gray-50 rounded-xl p-3 mb-3 text-xs space-y-1.5">
                                {GST_SLABS.map((slab) => (
                                    <div key={slab.rate} className="flex justify-between">
                                        <span className="font-medium text-gray-700">{slab.label}</span>
                                        <span className="text-gray-500">{slab.description}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Custom Percentage */}
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={useCustomRate}
                                    onChange={(e) => setUseCustomRate(e.target.checked)}
                                    className="w-4 h-4 text-emerald-500 rounded"
                                />
                                Custom %
                            </label>
                            {useCustomRate && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={customRate}
                                        onChange={(e) => setCustomRate(e.target.value)}
                                        placeholder="Enter %"
                                        className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    />
                                    <Percent className="w-4 h-4 text-gray-400" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Calculation Result */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 space-y-3 border border-emerald-100">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Base Amount</span>
                            <span className="font-medium text-gray-800">
                                {formatCurrency(baseAmount)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                                GST @ {rate}%
                                <span className="text-xs text-gray-400 ml-1">
                                    ({rate / 2}% CGST + {rate / 2}% SGST)
                                </span>
                            </span>
                            <span className="font-medium text-emerald-600">
                                + {formatCurrency(gstAmount)}
                            </span>
                        </div>
                        <hr className="border-emerald-200" />
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-800">Total Amount</span>
                            <span className="text-xl font-bold text-emerald-600">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-gray-700 mb-1">💡 Quick Tips:</p>
                        <ul className="space-y-0.5 list-disc list-inside">
                            <li>18% GST is most common for packaging products</li>
                            <li>CGST + SGST = Total GST (for intra-state)</li>
                            <li>For inter-state: IGST = full GST rate</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Trigger Button Component (to use in chat section)
export function GSTCalculatorButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
            title="GST Calculator"
        >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">GST Calculator</span>
        </button>
    );
}
