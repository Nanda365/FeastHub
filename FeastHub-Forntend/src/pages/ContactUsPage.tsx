import React from 'react';
import { useForm } from 'react-hook-form';
import { Mail, User, MessageSquare, Send, Phone, MapPin } from 'lucide-react';

interface ContactFormInputs {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactUsPage = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormInputs>();

  const onSubmit = (data: ContactFormInputs) => {
    console.log(data);
    alert('Message sent! (Check console for data)');
    reset();
  };

  return (
    <div className="min-h-screen bg-background-gray py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:p-10">
          <h1 className="font-poppins font-bold text-3xl text-accent-charcoal mb-6 text-center">Contact Us</h1>
          <p className="font-inter text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have a question, feedback, or need assistance, our team is ready to help. Please fill out the form below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div>
              <h2 className="font-poppins font-semibold text-xl text-accent-charcoal mb-4">Our Details</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Mail className="w-5 h-5 text-primary-orange" />
                  <span className="font-inter">support@feasthub.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Phone className="w-5 h-5 text-primary-orange" />
                  <span className="font-inter">+91 98765 43210</span>
                </div>
                <div className="flex items-start space-x-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-primary-orange mt-1" />
                  <span className="font-inter">123 Health Lane, Koramangala, Bangalore, India</span>
                </div>
              </div>
              <p className="font-inter text-gray-600 mt-6">
                Our customer support hours are Monday to Friday, 9:00 AM to 6:00 PM (IST). We strive to respond to all inquiries within 24-48 hours. For urgent matters, please call our support line.
              </p>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-poppins font-semibold text-xl text-accent-charcoal mb-4">Send us a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block font-inter font-medium text-accent-charcoal mb-2">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none transition-colors font-inter"
                      placeholder="Enter your name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block font-inter font-medium text-accent-charcoal mb-2">Your Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none transition-colors font-inter"
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="subject" className="block font-inter font-medium text-accent-charcoal mb-2">Subject</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="subject"
                      {...register('subject', { required: 'Subject is required' })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none transition-colors font-inter"
                      placeholder="Enter subject"
                    />
                  </div>
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block font-inter font-medium text-accent-charcoal mb-2">Your Message</label>
                  <textarea
                    id="message"
                    {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Message must be at least 10 characters' } })}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none transition-colors font-inter"
                    placeholder="Type your message here..."
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 bg-primary-orange text-white py-3 rounded-xl font-inter font-semibold hover:bg-primary-orange/90 transition-colors"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;