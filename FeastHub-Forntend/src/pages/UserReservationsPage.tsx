import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Clock, CheckCircle, XCircle, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import CancellationReasonModal from '../components/CancellationReasonModal';

interface Restaurant {
  _id: string;
  name: string;
  imageUrl: string;
}

interface Table {
  _id: string;
  tableNumber: string;
  seatingCapacity: number;
}

interface Reservation {
  _id: string;
  restaurant: Restaurant;
  table?: Table;
  numberOfGuests: number;
  reservationTime: string;
  status: 'pending' | 'confirmed' | 'occupied' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdAt: string;
}

const UserReservationsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingReservationId, setCancellingReservationId] = useState<string | null>(null);

  const fetchUserReservations = async () => {
    if (!token || !user || user.role !== 'customer') {
      setLoading(false);
      setError('Please log in as a customer to view your reservations.');
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get<Reservation[]>(`${import.meta.env.VITE_API_URL}/reservations`, config);
      setReservations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching user reservations:', err);
      setError(err.response?.data?.message || 'Failed to fetch reservations');
      toast.error(err.response?.data?.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reason: string) => {
    if (!cancellingReservationId) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put<Reservation>(
        `${import.meta.env.VITE_API_URL}/reservations/${cancellingReservationId}`,
        { status: 'cancelled', cancellationReason: reason },
        config
      );
      setReservations((prev = []) =>
        prev.map((res) => (res._id === cancellingReservationId ? data : res))
      );
      toast.success('Reservation cancelled successfully');
    } catch (err: any) {
      console.error('Error cancelling reservation:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setIsCancelModalOpen(false);
      setCancellingReservationId(null);
    }
  };

  useEffect(() => {
    fetchUserReservations();
  }, [user, token]);

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background-gray flex items-center justify-center">Loading your reservations...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-background-gray flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-background-gray py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-poppins font-bold text-3xl text-accent-charcoal mb-6">Your Table Reservations</h1>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-poppins font-semibold text-xl text-accent-charcoal mb-2">No Reservations Yet</h3>
            <p className="font-inter text-gray-600 mb-4">You haven't made any table reservations. Explore restaurants and book a table!</p>
                              <Link to={`/restaurants`} className="bg-gradient-teal-cyan text-white px-6 py-3 rounded-xl font-inter font-semibold hover:shadow-lg transition-shadow">
                          Find Restaurants
                        </Link>
                      </div>
                    ) : (
                      <>
                        <CancellationReasonModal
                          isOpen={isCancelModalOpen}
                          onClose={() => setIsCancelModalOpen(false)}
                          onConfirm={handleCancelReservation}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {reservations.map((reservation) => (
                            <div key={reservation._id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-poppins font-bold text-xl text-accent-charcoal">{reservation.restaurant.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-inter font-medium ${getStatusColor(reservation.status)}`}>
                                  {reservation.status}
                                </span>
                              </div>
                              <p className="font-inter text-gray-600 mb-2 flex items-center"><Clock className="w-4 h-4 mr-2" /> {new Date(reservation.reservationTime).toLocaleString()}</p>
                              <p className="font-inter text-gray-600 mb-2 flex items-center"><Utensils className="w-4 h-4 mr-2" /> {reservation.numberOfGuests} Guests</p>
                              {reservation.table && (
                                <p className="font-inter text-gray-600 mb-2 flex items-center"><Utensils className="w-4 h-4 mr-2" /> Table {reservation.table.tableNumber} (Capacity: {reservation.table.seatingCapacity})</p>
                              )}
                              {reservation.specialRequests && (
                                <p className="font-inter text-gray-600 mb-2">Special Requests: {reservation.specialRequests}</p>
                              )}
                              <div className="mt-auto pt-4 flex items-center justify-between">
                                <Link to={`/menu/${reservation.restaurant._id}`} className="text-primary-orange hover:underline font-inter font-semibold">
                                  View Restaurant Menu
                                </Link>
                                {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                  <button
                                    onClick={() => {
                                      setIsCancelModalOpen(true);
                                      setCancellingReservationId(reservation._id);
                                    }}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-inter font-semibold hover:bg-red-600 transition-colors"
                                  >
                                    Cancel Reservation
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}      </div>
    </div>
  );
};

export default UserReservationsPage;
