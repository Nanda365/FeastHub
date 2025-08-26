import React, { useState } from 'react';
import AlertDialog from '../components/AlertDialog';

const FoodDonatePage: React.FC = () => {
  const [formData, setFormData] = useState({
    foodItem: '',
    quantity: '',
    expirationDate: '',
    pickupLocation: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalTitle('');
    setModalMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable button during submission

    try {
      const response = await fetch('/api/donations', { // Assuming this endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setModalTitle('Donation Successful!');
        setModalMessage('Thank you for your donation! We will contact you shortly.');
        setIsModalOpen(true);
        // Optionally clear the form
        setFormData({
          foodItem: '',
          quantity: '',
          expirationDate: '',
          pickupLocation: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
        });
      } else {
        const errorData = await response.json();
        setModalTitle('Donation Failed');
        setModalMessage(`Failed to submit donation: ${errorData.message || response.statusText}`);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      setModalTitle('Error');
      setModalMessage('An error occurred while submitting your donation. Please try again.');
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          Donate Food
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Thank you for your generosity! Please fill out the form below to donate food.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="foodItem" className="block text-sm font-medium text-gray-700">
              Food Item(s)
            </label>
            <input
              type="text"
              name="foodItem"
              id="foodItem"
              value={formData.foodItem}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity (e.g., 5 lbs, 3 boxes)
            </label>
            <input
              type="text"
              name="quantity"
              id="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
              Expiration Date (if applicable)
            </label>
            <input
              type="date"
              name="expirationDate"
              id="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700">
              Pickup Location/Address
            </label>
            <textarea
              name="pickupLocation"
              id="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              rows={3}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          <fieldset>
            <legend className="text-base font-medium text-gray-900">Contact Information</legend>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  name="contactName"
                  id="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  id="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </fieldset>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Donation'}
            </button>
          </div>
        </form>
      </div>

      <AlertDialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
};

export default FoodDonatePage;
