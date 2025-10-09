import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TableOption {
  _id: string;
  tableNumber: string;
  seatingCapacity: number;
}

interface Reservation {
  _id?: string;
  restaurant: string;
  table?: string;
  user?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  numberOfGuests: number;
  reservationTime: Date;
  status: 'pending' | 'confirmed' | 'occupied' | 'cancelled' | 'completed';
  specialRequests?: string;
}

interface ReservationFormProps {
  reservation?: Reservation; // Optional, for editing existing reservation
  onSave: (reservationData: Omit<Reservation, '_id' | 'restaurant' | 'user'>) => void;
  onCancel: () => void;
  availableTables: TableOption[];
}

const ReservationForm: React.FC<ReservationFormProps> = ({ reservation, onSave, onCancel, availableTables }) => {
  const [customerName, setCustomerName] = useState(reservation?.customerName || '');
  const [customerEmail, setCustomerEmail] = useState(reservation?.customerEmail || '');
  const [customerPhone, setCustomerPhone] = useState(reservation?.customerPhone || '');
  const [numberOfGuests, setNumberOfGuests] = useState(reservation?.numberOfGuests || 1);
  const [reservationTime, setReservationTime] = useState<Date>(reservation?.reservationTime ? new Date(reservation.reservationTime) : new Date());
  const [status, setStatus] = useState<Reservation['status']>(reservation?.status || 'pending');
  const [specialRequests, setSpecialRequests] = useState(reservation?.specialRequests || '');
  const [selectedTable, setSelectedTable] = useState<string>(reservation?.table || '');

  useEffect(() => {
    if (reservation) {
      setCustomerName(reservation.customerName || '');
      setCustomerEmail(reservation.customerEmail || '');
      setCustomerPhone(reservation.customerPhone || '');
      setNumberOfGuests(reservation.numberOfGuests);
      setReservationTime(new Date(reservation.reservationTime));
      setStatus(reservation.status);
      setSpecialRequests(reservation.specialRequests || '');
      setSelectedTable(reservation.table || '');
    }
  }, [reservation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      customerName,
      customerEmail,
      customerPhone,
      numberOfGuests,
      reservationTime,
      status,
      specialRequests,
      tableId: selectedTable || undefined, // Pass tableId if selected
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="font-poppins font-semibold text-lg text-accent-charcoal mb-4">
        {reservation ? 'Edit Reservation' : 'Add New Reservation'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              id="customerName"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">Customer Email</label>
            <input
              type="email"
              id="customerEmail"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Customer Phone</label>
            <input
              type="tel"
              id="customerPhone"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>
          <div>
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
          <div>
            <label htmlFor="reservationTime" className="block text-sm font-medium text-gray-700">Reservation Time</label>
            <DatePicker
              selected={reservationTime}
              onChange={(date: Date) => setReservationTime(date)}
              showTimeSelect
              dateFormat="Pp"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
              required
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
              value={status}
              onChange={(e) => setStatus(e.target.value as Reservation['status'])}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="occupied">Occupied</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label htmlFor="table" className="block text-sm font-medium text-gray-700">Assign Table</label>
            <select
              id="table"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
            >
              <option value="">-- Select Table --</option>
              {availableTables.map(table => (
                <option key={table._id} value={table._id}>
                  Table {table.tableNumber} (Capacity: {table.seatingCapacity})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">Special Requests</label>
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
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-orange hover:bg-primary-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
          >
            {reservation ? 'Update Reservation' : 'Add Reservation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;
