import { useState } from 'react'
import { X, ArrowRight, Play } from 'lucide-react'
import ContactForm from './ContactForm' // Import the ContactForm component

// Import your images
import hero6 from "../assets/images/heroimg/test.png"
import hero11 from "../assets/images/heroimg/hero11.png"
import hero7 from "../assets/images/heroimg/hero7.jpg"
import hero15 from "../assets/images/heroimg/hero15.png"
import analysis from "../assets/images/heroimg/analysis.png"

const ImageModal = ({ isOpen, onClose, src, alt }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
      <div className="relative max-w-[95vw] max-h-[95vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white rounded-full p-3 hover:bg-gray-200 transition-colors duration-200 shadow-lg z-10"
        >
          <X className="h-6 w-6 text-gray-800" />
        </button>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  )
}

const SplitCards = () => {
  const [expandedCard, setExpandedCard] = useState(null)
  const [modalImage, setModalImage] = useState(null)
  const [contactFormOpen, setContactFormOpen] = useState(false) // Add contact form state

  const backgroundColors = [
    'bg-gradient-to-br from-pink-300 via-rose-300 to-red-200',
    'bg-gradient-to-br from-teal-300 via-cyan-300 to-blue-200',
    'bg-gradient-to-br from-green-300 via-emerald-300 to-teal-200',
    'bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-200',
    'bg-gradient-to-br from-purple-300 via-violet-300 to-fuchsia-200',
    'bg-gradient-to-br from-indigo-300 via-blue-300 to-cyan-200'
  ]

  const cardData = [
    {
      id: 1,
      title: "Collaborate on Projects",
      benefit: "Chatbot-guided collaboration, invite and manage collaborators.",
      thumb: hero7,
      expandedContent: {
        subtitle: "Accelerate your research impact through powerful academic partnerships.",
        description: "Collaborate seamlessly with faculty inside your institution and across universities. Discover and join funded projects, grant opportunities, and collaborative research initiatives.",
        features: [
          "Search for ongoing projects or post your own ideas to attract expert collaborators",
          "Send and manage collaboration requests efficiently",
          "Dedicated communication channels streamline coordination from proposal to publication"
        ],
        teacherBenefit: "For Researchers and Faculty: Expand your research network, enhance project funding potential, and co-author high-impact publications with ease.",
        cta: "Find your next research partner—start exploring collaboration and funding opportunities today.",
        buttonText: "Create Project"
      }
    },
    {
      id: 2,
      title: "Effortless Data Entry",
      benefit: "Add publications, achievements, projects via chatbot.",
      thumb: hero15,
      expandedContent: {
        subtitle: "Update records without memorizing workflows.",
        description: "Add publications, projects, achievements via chatbot prompts. Data is automatically saved in the correct module.",
        features: [
          "No manual form filling required",
          "Instant validation and error checking",
          "Smart data categorization and organization"
        ],
        teacherBenefit: "Saves hours of manual entry and reduces errors.",
        cta: "Update your publications and achievements in seconds—let the chatbot do the work for you.",
        buttonText: "Add Data Now"
      }
    },
    {
      id: 3,
      title: "AI-Powered Assessments",
      benefit: "Generate question papers and assessments instantly.",
      thumb: hero11,
      expandedContent: {
        subtitle: "Create question papers in minutes.",
        description: "Just tell the chatbot your subject, topics, and difficulty. AI generates a full assessment ready to publish.",
        features: [
          "Multiple question types supported",
          "Customizable difficulty levels",
          "Instant grading and feedback systems"
        ],
        teacherBenefit: "Reduce prep time while maintaining high-quality assessments.",
        cta: "Generate your first assessment in minutes—save hours of prep time.",
        buttonText: "Create Assessment"
      }
    },
    {
      id: 4,
      title: "Student-Friendly Test Navigation",
      benefit: "Clean, distraction-free test interface.",
      thumb: hero6,
      expandedContent: {
        subtitle: "Tests students actually enjoy taking.",
        description: "Clean, distraction-free interface with mobile-friendly and intuitive navigation.",
        features: [
          "Mobile-friendly design",
          "Intuitive navigation controls", 
          "Progress tracking and time management"
        ],
        teacherBenefit: "Improves student engagement and testing experience.",
        cta: "Give your students a smooth testing experience—set up your first test today.",
        buttonText: "Create Test"
      }
    },
    {
      id: 5,
      title: "Your Personal AI Teaching Assistant",
      benefit: "Creates syllabus, curates videos, schedules your course.",
      thumb: analysis,
      expandedContent: {
        subtitle: "Your All-in-One AI Teaching Assistant",
        description: "Empower your teaching with an AI assistant that supports every step of the learning journey.",
        features: [
          "Designs and structures complete courses",
          "Delivers interactive classes and explains concepts with curated videos and learning materials",
          "Creates assignments, quizzes, and projects",
          "Conducts assessments"
        ],
        teacherBenefit: "For Teachers: Amplify your teaching, reduce workload, and ensure students receive consistent, high-quality learning experiences.",
        cta: "Let AI handle the heavy lifting—so you can focus on inspiring minds. Start building your AI-powered course today.",
        buttonText: "Set Up Course"
      }
    },
    {
      id: 6,
      title: "AI Video Analysis",
      benefit: "Automatically find, analyze, and create assignments from YouTube videos.",
      thumb: analysis,
      expandedContent: {
        subtitle: "Automatically find the best educational videos on YouTube, analyze them with advanced AI, and create dynamic assignments effortlessly.",
        description: "How It Works: AI searches YouTube based on your class topics, analyzes videos using Gemini AI, generates unique assignments, and posts everything in your course's AI Chat room for easy access.",
        features: [
          "✨ Dynamic Assignments: AI creates unique assignments tailored to each video's content",
          "✨ Whole Day Analysis: AI performs analysis throughout the entire scheduled day",
          "✨ Real-Time Updates: Status updates appear automatically without needing to refresh",
          "✨ Enhanced Discussion: AI provides detailed topic summaries and fosters in-depth discussions"
        ],
        teacherBenefit: "Transform any YouTube video into engaging learning content with zero manual effort.",
        cta: "Turn YouTube into your teaching superpower—let AI curate and analyze videos for your courses.",
        buttonText: "Start Video Analysis"
      }
    }
  ]

  const handleCardClick = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId)
  }

  const openImageModal = (imageSrc, imageAlt) => {
    setModalImage({ src: imageSrc, alt: imageAlt })
  }

  const closeImageModal = () => {
    setModalImage(null)
  }

  // Add handler for opening contact form
  const handleActionButtonClick = (e) => {
    e.stopPropagation()
    setContactFormOpen(true)
  }

  // Add handler for closing contact form
  const handleCloseContactForm = () => {
    setContactFormOpen(false)
  }

  return (
    <>
      <section id='features' className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Premium Features That Elevate Teaching
            </h2>
            <p className="text-xl text-gray-600">
              Campus Technology is always testing, iterating, and rolling out new upgrades to make our products better and easier to use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cardData.map((card, index) => {
              const isExpanded = expandedCard === card.id
              const bgColor = backgroundColors[index % backgroundColors.length]
              
              return (
                <div
                  key={card.id}
                  className={`${bgColor} rounded-3xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl ${
                    isExpanded ? 'md:col-span-2' : ''
                  }`}
                >
                  {!isExpanded && (
                    <div className="p-8 min-h-[500px] flex flex-col">
                      <h3 className="text-2xl font-bold text-gray-800 text-center mb-4 leading-tight">
                        {card.title}
                      </h3>

                      <p className="text-gray-700 text-center mb-6 font-medium">
                        {card.benefit}
                      </p>

                      <div className="flex justify-center items-center mb-6 flex-grow">
                        <img
                          src={card.thumb}
                          alt={card.title}
                          className="w-full max-w-sm h-48 object-cover cursor-pointer transition-transform duration-500 transform hover:scale-110 rounded-2xl shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation()
                            openImageModal(card.thumb, card.title)
                          }}
                        />
                      </div>

                      <div className="text-center">
                        <button
                          onClick={() => handleCardClick(card.id)}
                          className="bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-2"
                        >
                          Learn More
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="p-8 min-h-[500px]">
                      <div className="max-w-4xl mx-auto">
                        <div className="flex justify-end mb-4">
                          <button
                            onClick={() => handleCardClick(card.id)}
                            className="bg-white hover:bg-gray-100 text-gray-800 p-2 rounded-full transition-all duration-200 shadow-lg"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-start">
                          {/* Left Column - Content with BLACK text */}
                          <div className="text-gray-900 space-y-6">
                            <h3 className="text-3xl font-bold text-gray-900">
                              {card.title}
                            </h3>
                            
                            <h4 className="text-xl font-semibold text-gray-800">
                              {card.expandedContent.subtitle}
                            </h4>

                            <p className="text-gray-700 leading-relaxed">
                              {card.expandedContent.description}
                            </p>

                            {card.expandedContent.features && (
                              <ul className="space-y-3">
                                {card.expandedContent.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                                    <div className="w-2 h-2 bg-gray-800 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm leading-relaxed">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h5 className="font-semibold text-blue-800 mb-2">Teacher Benefit:</h5>
                              <p className="text-blue-700 text-sm leading-relaxed">{card.expandedContent.teacherBenefit}</p>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-green-700 text-sm italic mb-4 leading-relaxed">
                                {card.expandedContent.cta}
                              </p>
                              <button 
                                onClick={handleActionButtonClick}
                                className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors duration-200 shadow-lg inline-flex items-center gap-2"
                              >
                                <Play className="h-4 w-4" />
                                {card.expandedContent.buttonText}
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <img
                              src={card.thumb}
                              alt={card.title}
                              className="w-full max-w-md rounded-2xl shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                              onClick={(e) => {
                                e.stopPropagation()
                                openImageModal(card.thumb, card.title)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <ImageModal
          isOpen={modalImage !== null}
          onClose={closeImageModal}
          src={modalImage?.src}
          alt={modalImage?.alt}
        />
      </section>

      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={contactFormOpen} 
        onClose={handleCloseContactForm} 
      />
    </>
  )
}

export default SplitCards
