// src/components/FAQ.jsx
import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const faqs = [
    {
      question: "How quickly can we implement CampusTechnology at our institution?",
      answer: "Implementation typically takes 4-6 weeks depending on your institution size and requirements. Our dedicated implementation team will work with you to ensure a smooth transition with minimal disruption to your operations."
    },
    {
      question: "Is our student data secure with your platform?",
      answer: "Absolutely. We employ enterprise-grade security measures including data encryption, secure cloud infrastructure, regular security audits, and FERPA compliance. Your data is protected with the highest security standards."
    },
    {
      question: "Can CampusTechnology integrate with our existing systems?",
      answer: "Yes, our platform offers extensive integration capabilities with popular LMS platforms, accounting software, communication tools, and other educational technology solutions. We also provide API access for custom integrations."
    },
    {
      question: "What kind of support do you provide during and after implementation?",
      answer: "We provide comprehensive support including dedicated account management, 24/7 technical support, training sessions for staff, documentation, and regular check-ins to ensure optimal platform utilization."
    },
    {
      question: "How much does CampusTechnology cost?",
      answer: "Our pricing is based on your institution size and required features. We offer flexible plans starting from $5 per student per month. Contact our sales team for a customized quote based on your specific needs."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const handleContactClick = () => {
    setFormOpen(true)
  }

  return (
    <>
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Have Questions? We've got answers
            </h2>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
                >
                  <span className="text-lg font-medium text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  {openFAQ === index ? (
                    <Minus className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                
                <div className={`transition-all duration-300 ease-in-out ${
                  openFAQ === index 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <button 
              onClick={handleContactClick}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors duration-200"
            >
              Contact Our Support Team
            </button>
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 sm:p-8">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl sm:text-2xl"
              onClick={() => setFormOpen(false)}
            >
              ×
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-blue-600 text-center mb-4 sm:mb-6 pr-6">
              Contact Our Support Team
            </h2>

            <form className="flex flex-col gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full rounded-lg bg-gray-50 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full rounded-lg bg-gray-50 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-lg bg-gray-50 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
              />
              <textarea
                placeholder="Your Question or Message"
                rows="4"
                className="w-full rounded-lg bg-gray-50 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 resize-none"
              ></textarea>

              <button
                type="submit"
                className="w-full mt-2 sm:mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 sm:py-3 rounded-lg font-semibold transition shadow-md text-sm sm:text-base"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default FAQ
