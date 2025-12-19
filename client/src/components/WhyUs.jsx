// src/components/WhyUs.jsx
import { useState } from 'react' // Add useState import
import { MessageCircle, Users, Zap, GraduationCap, TrendingUp, Rocket } from 'lucide-react'
import ContactForm from './ContactForm' // Import ContactForm component

const WhyUs = () => {
  const [contactFormOpen, setContactFormOpen] = useState(false) // Add contact form state

  const keyPoints = [
    {
      id: 1,
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Chatbot-first design",
      description: "Just answer questions, and tasks are done.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      icon: <Users className="h-8 w-8" />,
      title: "Teacher-first focus",
      description: "Saves time, reduces complexity.",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      icon: <Zap className="h-8 w-8" />,
      title: "Collaboration simplified",
      description: "Start projects and find peers with ease.",
      color: "from-orange-500 to-red-500"
    },
    {
      id: 4,
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Student-centered experience",
      description: "Clean test navigation, curated content.",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 5,
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Future-ready",
      description: "From teaching to reporting, accreditation, and ERP, the platform grows with you.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      id: 6,
      icon: <Rocket className="h-8 w-8" />,
      title: "Future-Ready Scalability",
      description: "A platform that evolves with your institution's needs.",
      color: "from-teal-500 to-cyan-500"
    }
  ]

  // Add handler for opening contact form
  const handleBookDemo = () => {
    setContactFormOpen(true)
  }

  // Add handler for closing contact form
  const handleCloseContactForm = () => {
    setContactFormOpen(false)
  }

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              We're not just another platform.{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                We're a conversation.
              </span>
            </h2>
                      
            <div className="max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                While other platforms expect you to learn them, ours adapts to you. With an AI chatbot at the center, we make teaching tasks{' '}
                <span className="font-semibold text-gray-800">simple</span>,{' '}
                <span className="font-semibold text-gray-800">fast</span>, and{' '}
                <span className="font-semibold text-gray-800">stress-free</span>.
              </p>
            </div>
          </div>

          {/* Key Points Grid - Updated for 6 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {keyPoints.map((point, index) => (
              <div
                key={point.id}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${point.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                              
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${point.color} mb-6 shadow-lg`}>
                  <div className="text-white">
                    {point.icon}
                  </div>
                </div>
                              
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                  {point.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {point.description}
                </p>

                {/* Number Badge */}
                <div className="absolute top-6 right-6 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 group-hover:bg-gray-200 transition-colors">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Talk to your platform. Let AI handle the rest
              </h3>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Join thousands of educators who've already discovered how easy teaching technology can be.
              </p>
                          
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleBookDemo}
                  className="bg-white text-gray-800 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                >
                  Book a Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={contactFormOpen} 
        onClose={handleCloseContactForm} 
      />
    </>
  )
}

export default WhyUs
