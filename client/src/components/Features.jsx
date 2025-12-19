// src/components/Features.jsx
import { useState } from 'react'
import { Plus, Minus, Zap, Monitor, CheckCircle, Clipboard, Book, FileText } from 'lucide-react'

const Features = () => {
    const [expandedCard, setExpandedCard] = useState(null)

    const featureItems = [
        {
            id: 1,
            title: "ERP",
            description: "Streamlines student and faculty processes to boost institutional efficiency.",
            icon: <Zap className="h-8 w-8 text-blue-600" />,
            color: 'from-blue-400 to-blue-600'
        },
        {
            id: 2,
            title: "LMS",
            description: "Centralized platform for easy access to learning resources and tools.",
            icon: <Monitor className="h-8 w-8 text-green-600" />,
            color: 'from-green-400 to-green-600'
        },
        {
            id: 3,
            title: "Accreditation",
            description: "Supports quality assurance and compliance through structured documentation and evaluation processes.",
            icon: <CheckCircle className="h-8 w-8 text-purple-600" />,
            color: 'from-purple-400 to-purple-600'
        },
        {
            id: 4,
            title: "Exam Management",
            description: "Facilitates organized and secure assessments, ensuring smooth conduct and transparent evaluation.",
            icon: <Clipboard className="h-8 w-8 text-orange-600" />,
            color: 'from-orange-400 to-orange-600'
        },
        {
            id: 5,
            title: "Tutorials",
            description: "Step-by-step resources to aid compliance, learning, and system usage.",
            icon: <Book className="h-8 w-8 text-indigo-600" />,
            color: 'from-indigo-400 to-indigo-600'
        },
        {
            id: 6,
            title: "Content",
            description: "Innovative educational materials aligned with evolving academic standards.",
            icon: <FileText className="h-8 w-8 text-teal-600" />,
            color: 'from-teal-400 to-teal-600'
        }
    ]

    // Fixed toggle function - ensures only ONE card is open at a time
    const toggleCard = (cardId) => {
        setExpandedCard(prevExpanded => prevExpanded === cardId ? null : cardId)
    }

    return (
        <section id="product" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Transform Your Institution
                    </h2>
                    <p className="text-xl text-gray-600">
                        All-in-one ERP and LMS platform for modern education.
                    </p>

                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featureItems.map((feature) => (
                        <div
                            key={feature.id}
                            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div className="p-6">
                                {/* Icon and Plus/Minus Button */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color}`}>
                                        <div className="text-white">
                                            {feature.icon}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleCard(feature.id)}
                                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                                        aria-label={expandedCard === feature.id ? 'Collapse description' : 'Expand description'}
                                    >
                                        {expandedCard === feature.id ? (
                                            <Minus className="h-5 w-5 text-gray-600" />
                                        ) : (
                                            <Plus className="h-5 w-5 text-gray-600" />
                                        )}
                                    </button>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>

                                {/* Description - Only shows when this specific card is expanded */}
                                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedCard === feature.id
                                        ? 'max-h-96 opacity-100'
                                        : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className="border-t border-gray-200 pt-4">
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
