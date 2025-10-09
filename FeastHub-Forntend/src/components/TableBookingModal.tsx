import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TableBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBook: (bookingDetails: { numberOfGuests: number; reservationTime: Date; specialRequests: string }) => void;
  restaurantName: string;
}

const TableBookingModal: React.FC<TableBookingModalProps> = ({ isOpen, onClose, onBook, restaurantName }) => {
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [reservationTime, setReservationTime] = useState<Date>(new Date());
  const [specialRequests, setSpecialRequests] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook({ numberOfGuests, reservationTime, specialRequests });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
        <h2 className="font-poppins font-bold text-2xl text-accent-charcoal mb-4">Book a Table at {restaurantName}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700">Number of Guests</label>
            <input
              type="number"
              id="numberOfGuests"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
              min="1"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="reservationTime" className="block text-sm font-medium text-gray-700">Desired Time</label>
            <DatePicker
              selected={reservationTime}
              onChange={(date: Date) => setReservationTime(date)}
              showTimeSelect
              dateFormat="Pp"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">Special Requests (optional)</label>
            <textarea
              id="specialRequests"
              rows={3}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-orange hover:bg-primary-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
            >
              Request Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableBookingModal;
