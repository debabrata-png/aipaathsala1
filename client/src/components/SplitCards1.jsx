import { useState } from 'react'
import { Plus, X } from 'lucide-react'

// Import your images
// import hero14 from "../assets/images/heroimg/hero14.png"
import hero12 from "../assets/images/heroimg/hero12.png"
// import hero13 from "../assets/images/heroimg/hero13.png"
import hero6 from "../assets/images/heroimg/test.png"
import hero8 from "../assets/images/heroimg/hero8.png"
import hero11 from "../assets/images/heroimg/hero11.png"
import hero7 from "../assets/images/heroimg/hero7.jpg"
import hero15 from "../assets/images/heroimg/hero15.png"
import patent from "../assets/images/heroimg/patents.png"
import seminar from "../assets/images/heroimg/seminar.png"
import publication from "../assets/images/heroimg/publication.png"
import consultancy from "../assets/images/heroimg/consultancy.png"



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

  const backgroundColors = [
    'bg-gradient-to-br from-pink-300 via-rose-300 to-red-200',
    'bg-gradient-to-br from-yellow-300 via-orange-300 to-amber-200',
    'bg-gradient-to-br from-green-300 via-emerald-300 to-teal-200',
    'bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-200',
    'bg-gradient-to-br from-purple-300 via-violet-300 to-fuchsia-200',
    'bg-gradient-to-br from-indigo-300 via-blue-300 to-cyan-200',
    'bg-gradient-to-br from-orange-300 via-red-300 to-pink-200',
    'bg-gradient-to-br from-teal-300 via-green-300 to-lime-200'
  ]

  const cardData = [
    {
      id: 1,
      title: "Project Collaboration Module",
      thumb: hero7,
      description: "The Project Collaboration Module facilitates seamless teamwork between faculty and students for research, publications, and innovative projects. When a faculty member initiates a new project, they can use the chatbot interface to define project details, objectives, and requirements. Faculty can then search for interested students within the system who match the skillset or academic background needed. Students can request to join or be invited to collaborate, creating a dynamic team environment. This module promotes research-driven learning, fosters innovation, and provides students with real-world exposure while helping faculty successfully execute projects for publications and academic growth."
    },
    {
      id: 2,
      title: "Collaborative Project Chat Room", 
      thumb: hero15,
      description: "The Project Collaboration Module facilitates seamless teamwork between faculty and students for research, publications, and innovative projects. When a faculty member initiates a new project, they can use the chatbot interface to define project details, objectives, and requirements. Faculty can then search for interested students within the system who match the skillset or academic background needed. Students can request to join or be invited to collaborate, creating a dynamic team environment. This module promotes research-driven learning, fosters innovation, and provides students with real-world exposure while helping faculty successfully execute projects for publications and academic growth."
    },
    {
      id: 3,
      title: "Patent Management",
      thumb: patent,
      description: "Empower faculty and researchers with an intelligent Patent Management system. Our AI-powered backend chat assistant simplifies the process of creating and documenting patents, reducing manual effort and ensuring accuracy. Institutions can easily track, view, edit, download, or delete patent records in one centralized platform, enabling seamless management of intellectual property and fostering a culture of innovation."
    },
    {
      id: 4,
      title: "Test & Assessment",
      thumb: hero12,
      description: "The Test & Assessment Module empowers faculty to design, schedule, and manage tests seamlessly through the chatbot interface. Faculty can create question banks, set difficulty levels, define time limits, and generate assessments tailored to specific courses or learning objectives. The chatbot ensures a guided and interactive experience, reducing complexity in test creation. Students can log in, receive test notifications, and attempt assessments directly within the system, with instant submission tracking and automated grading options. This module enhances transparency, reduces administrative workload, and ensures a fair evaluation process while providing real-time performance insights for both faculty and students."
    },
    {
      id: 5,
      title: "Seminar Management",
      thumb: seminar,
      description: "Streamline the planning and execution of academic seminars with our Seminar Management system. Faculty can effortlessly create, schedule, and manage seminars while providing participants with easy access to event details. The module supports attendance tracking, document sharing, and report generation, ensuring a smooth and organized experience for both organizers and attendees."
    },
    {
      id: 6,
      title: "Test Navigation & Control Panel",
      thumb: hero6,
      description: "The Test Navigation & Control Panel is designed to provide students with a smooth and user-friendly test-taking experience. Within this section, students can view all available test questions in sequence and easily move between them using Next and Previous buttons. A Submit button allows the final submission of responses once the test is complete. The system also supports controlled retakes, enabling students to reattempt the exam if permitted by faculty. This intuitive navigation ensures that students can focus on answering questions without technical confusion, while maintaining accuracy and fairness throughout the assessment process."
    },
    {
      id: 7,
      title: "Faculty Test Creation via AI Integration",
      thumb: hero8,
      description: "The Faculty MCQ Test Creation via API Integration module allows faculty members to quickly generate multiple-choice questions (MCQs) through secure API connectivity. By entering a valid API key into the chatbot interface, faculty can request automated question generation aligned with the selected course or topic. The system fetches high-quality MCQs, complete with options and correct answers, reducing the manual workload of question preparation. This feature streamlines assessment design, ensures question variety, and saves time while maintaining academic accuracy and consistency."
    },
    {
      id: 8,
      title: "AI-Driven Test Paper Generation",
      thumb: hero11,
      description: "The AI-Driven Test Paper Generation module enables faculty to collaborate directly with the integrated chatbot for effortless test creation. Instead of navigating complex forms, faculty simply respond to the chatbot’s guided prompts—such as the number of questions required, the duration of the test, start and end times, selected topics, and preferred difficulty levels. The chatbot collects these inputs step by step and automatically generates a complete test paper based on the given parameters. This conversational approach simplifies the test design process, reduces preparation time, and ensures that faculty can quickly produce structured, customized assessments with minimal effort."
    },
    {
      id:9,
      title:"Consultancy Management",
      thumb:consultancy,
      description:"Simplify and track faculty consultancy projects with our Consultancy Management system. This module enables faculty members to register new consultancy assignments, manage client details, and monitor project progress with ease. Institutions can maintain complete records of consultancy services, including agreements, financials, and outcomes—ensuring transparency, compliance, and efficient utilization of expertise for industry collaboration."
    },
    {
      id:10,
      title:"Publications Management",
      thumb:publication,
      description:"Centralize and showcase the research output of your institution with our Publications Management system. Faculty and researchers can easily add, update, and manage their published works, including journals, articles, and conference papers. The module provides options to view, edit, download, or delete records, while offering a structured repository that highlights the institution’s academic contributions and enhances research visibility."
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

  return (
    <section id='features' className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Education for today and beyond
          </h2>
          <p className="text-xl text-gray-600">
            Campus Technology is always testing, iterating, and rolling out new upgrades to make our products better and easier to use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {cardData.map((card, index) => {
            const isExpanded = expandedCard === card.id
            const bgColor = backgroundColors[index % backgroundColors.length]
            
            return (
              <div
                key={card.id}
                className={`${bgColor} rounded-3xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl relative min-h-[500px] p-10`}
              >
                <h3 className="text-3xl font-bold text-white text-center mb-8 leading-tight drop-shadow-lg">
                  {card.title}
                </h3>

                {!isExpanded && (
                  <div className="flex justify-center items-center mb-8 overflow-hidden rounded-2xl">
                    <img
                      src={card.thumb}
                      alt={card.title}
                      className="w-full max-w-md h-64 object-cover cursor-pointer transition-transform duration-500 transform hover:scale-110 rounded-2xl shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        openImageModal(card.thumb, card.title)
                      }}
                    />
                  </div>
                )}

                {isExpanded && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-white text-lg leading-relaxed text-center max-w-lg drop-shadow-md">
                      {card.description}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => handleCardClick(card.id)}
                  className="absolute bottom-6 left-6 bg-white hover:bg-gray-100 text-gray-800 p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isExpanded ? (
                    <X className="h-7 w-7" />
                  ) : (
                    <Plus className="h-7 w-7" />
                  )}
                </button>
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
  )
}

export default SplitCards
