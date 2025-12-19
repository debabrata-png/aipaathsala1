// src/components/ContactForm.jsx
import { useState } from 'react';
import ep3 from "../api/ep3"; // Fixed import path

const ContactForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await ep3.post('/createcontact', formData);

      if (response.data) {
        
        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: ''
        });

        // Show success message
        alert('Thank you for contacting us! We will get back to you soon.');
        
        // Close modal
        onClose();
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setError(error.response?.data?.message || 'Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 sm:p-8">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl sm:text-2xl"
          onClick={onClose}
          disabled={loading}
        >
          ×
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-blue-600 text-center mb-4 sm:mb-6 pr-6">
          Get In Touch With Us
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            className="w-full rounded-lg bg-gray-50 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            required
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            className="w-full rounded-lg bg-gray-50 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className="w-full rounded-lg bg-gray-50 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows="4"
            required
            value={formData.message}
            onChange={handleChange}
            disabled={loading}
            className="w-full rounded-lg bg-gray-50 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 sm:mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 sm:py-3 rounded-lg font-semibold transition shadow-md text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;

