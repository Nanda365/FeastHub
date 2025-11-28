import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

interface RestaurantTableBookingFormProps {
  restaurantId: string;
  restaurantName: string;
}

interface TableOption {
  _id: string;
  tableNumber: string;
  seatingCapacity: number;
  status: string;
  amount: number;
}

const RestaurantTableBookingForm: React.FC<RestaurantTableBookingFormProps> = ({ restaurantId, restaurantName }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [reservationTime, setReservationTime] = useState<Date>(new Date());
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState<TableOption[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedTableAmount, setSelectedTableAmount] = useState(0);
  const [fetchingTables, setFetchingTables] = useState(false);

  // Fetch available tables based on guests and time
  useEffect(() => {
    const fetchAvailableTables = async () => {
      if (!restaurantId || !token) return;

      setFetchingTables(true);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            restaurantId,
            numberOfGuests,
            reservationTime: reservationTime.toISOString(),
          },
        };
        const { data } = await axios.get<TableOption[]>(`${import.meta.env.VITE_API_URL}/tables`, config);
        setAvailableTables(data);
        if (data.length > 0) {
          setSelectedTable(data[0]._id); // Pre-select the first available table
          setSelectedTableAmount(data[0].amount || 0);
          console.log('Selected table amount (frontend): ', data[0].amount || 0);
        } else {
          setSelectedTable('');
          setSelectedTableAmount(0);
        }
      } catch (err: any) {
        console.error('Error fetching available tables:', err);
        toast.error(err.response?.data?.message || 'Failed to fetch available tables');
      } finally {
        setFetchingTables(false);
      }
    };

    fetchAvailableTables();
  }, [numberOfGuests, reservationTime, restaurantId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      toast.error('Please log in to make a reservation.');
      navigate('/login');
      return;
    }

    if (!selectedTable) {
      toast.error('Please select an available table.');
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      if (selectedTableAmount > 0) {
        const res = await loadRazorpayScript();

        if (!res) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          setLoading(false);
          return;
        }

        // Call backend to create Razorpay order
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/payment/table-booking`,
          {
            amount: selectedTableAmount,
            restaurantId,
            tableId: selectedTable,
            numberOfGuests,
            reservationTime: reservationTime.toISOString(),
            customerPhone,
            specialRequests,
          },
          config
        );
        const order = data.order; // Access the nested order object
        console.log('Order object from backend:', order);

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your Razorpay Key ID
          amount: order.amount,
          currency: order.currency,
          name: 'FeastHub',
          description: 'Table Booking Payment',
          order_id: order.id,
          handler: async function (response: any) {
            try {
              const verifyConfig = {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              };
              await axios.post(
                `${import.meta.env.VITE_API_URL}/payment/table-booking/verify`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  restaurantId,
                  tableId: selectedTable,
                  numberOfGuests,
                  reservationTime: reservationTime.toISOString(),
                  customerPhone,
                  specialRequests,
                },
                verifyConfig
              );
              toast.success('Payment successful! Table booked.');
              navigate('/reservations');
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error: any) {
              console.error('Error verifying payment:', error);
              toast.error(error.response?.data?.message || 'Payment verification failed.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: customerPhone,
          },
          notes: {
            restaurantId,
            tableId: selectedTable,
          },
          theme: {
            color: '#F37254',
          },
        };

        console.log('Razorpay options amount (frontend):', options.amount);

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();

        paymentObject.on('payment.failed', function (response: any) {
          toast.error(response.error.description || 'Payment failed.');
          setLoading(false);
        });

      } else {
        // Existing booking request logic
        await axios.post(
          `${import.meta.env.VITE_API_URL}/reservations`,
          {
            restaurantId,
            tableId: selectedTable, // Only send selectedTable if it's not null
            numberOfGuests,
            reservationTime: reservationTime.toISOString(),
            customerPhone,
            specialRequests,
          },
          config
        );
        toast.success('Table booking request sent! The restaurant will confirm shortly.');
        navigate('/reservations'); // Navigate to user's reservations page
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err: any) {
      console.error('Error sending booking request or processing payment:', err);
      toast.error(err.response?.data?.message || 'Failed to complete table booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
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
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            id="customerPhone"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="availableTable" className="block text-sm font-medium text-gray-700">Available Tables</label>
          {fetchingTables ? (
            <p className="text-gray-500">Searching for tables...</p>
          ) : availableTables.length > 0 ? (
            <select
              id="availableTable"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
              value={selectedTable}
              onChange={(e) => {
                const tableId = e.target.value;
                setSelectedTable(tableId);
                const table = availableTables.find(t => t._id === tableId);
                setSelectedTableAmount(table?.amount || 0);
                console.log('Selected table amount (frontend - onChange): ', table?.amount || 0);
              }}
              required
            >
              {availableTables.map((table) => (
                <option key={table._id} value={table._id}>
                  Table {table.tableNumber} (Capacity: {table.seatingCapacity}) - ₹{table.amount.toFixed(2)}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-red-500">No tables available for the selected guests and time.</p>
          )}
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
        <div className="flex justify-end">
            {selectedTable && selectedTableAmount > 0 ? (
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={loading || fetchingTables}
              >
                {loading ? 'Processing Payment...' : `Pay ₹${selectedTableAmount.toFixed(2)}`}
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-orange hover:bg-primary-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
                disabled={loading || fetchingTables || availableTables.length === 0}
              >
                {loading ? 'Submitting...' : 'Request Booking'}
              </button>
            )}        </div>
      </form>
    </div>
  );
};

export default RestaurantTableBookingForm;