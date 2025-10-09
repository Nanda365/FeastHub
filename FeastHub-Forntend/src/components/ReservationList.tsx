import React from 'react';
import { Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Table {
  _id: string;
  tableNumber: string;
  seatingCapacity: number;
}

interface Reservation {
  _id: string;
  restaurant: string;
  table?: Table;
  user?: User;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  numberOfGuests: number;
  reservationTime: string;
  status: 'pending' | 'confirmed' | 'occupied' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdAt: string;
}

interface ReservationListProps {
  reservations: Reservation[];
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservationId: string) => void;
  onUpdateStatus: (reservationId: string, newStatus: Reservation['status']) => void;
}

const ReservationList: React.FC<ReservationListProps> = ({ reservations, onEdit, onDelete, onUpdateStatus }) => {
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-8">
      <h3 className="font-poppins font-semibold text-lg text-accent-charcoal mb-4">Upcoming Reservations</h3>
      {reservations.length === 0 ? (
        <p className="text-gray-600">No reservations found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reservation.user ? reservation.user.name : reservation.customerName}
                    {reservation.user && <p className="text-gray-500 text-xs">({reservation.user.email})</p>}
                    {!reservation.user && reservation.customerEmail && <p className="text-gray-500 text-xs">({reservation.customerEmail})</p>}
                    {reservation.customerPhone && <p className="text-gray-500 text-xs">{reservation.customerPhone}</p>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.numberOfGuests}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(reservation.reservationTime).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.table ? `Table ${reservation.table.tableNumber} (Cap: ${reservation.table.seatingCapacity})` : 'Unassigned'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onEdit(reservation)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(reservation._id)} className="text-red-600 hover:text-red-900 mr-3">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {reservation.status === 'pending' && (
                      <button onClick={() => onUpdateStatus(reservation._id, 'confirmed')} className="text-green-600 hover:text-green-900 mr-3">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                      <button onClick={() => onUpdateStatus(reservation._id, 'cancelled')} className="text-gray-600 hover:text-gray-900">
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReservationList;
