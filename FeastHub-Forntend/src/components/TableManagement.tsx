import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import TableList from './TableList.tsx';
import TableForm from './TableForm.tsx';
import ReservationList from './ReservationList.tsx';
import ReservationForm from './ReservationForm.tsx';
import ConfirmationModal from './ConfirmationModal';
import { Plus } from 'lucide-react';

interface Table {
  _id: string;
  tableNumber: string;
  seatingCapacity: number;
  isAvailable: boolean;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  amount: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
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

interface TableManagementProps {
  restaurantId: string;
}

const TableManagement: React.FC<TableManagementProps> = ({ restaurantId }) => {
  const { token } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showTableForm, setShowTableForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | undefined>(undefined);
  const [tableCrudError, setTableCrudError] = useState<string | null>(null);
  const [isConfirmTableModalOpen, setIsConfirmTableModalOpen] = useState(false);
  const [tableToDeleteId, setTableToDeleteId] = useState<string | null>(null);

  const [showReservationForm, setShowReservationForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>(undefined);
  const [isConfirmReservationModalOpen, setIsConfirmReservationModalOpen] = useState(false);
  const [reservationToDeleteId, setReservationToDeleteId] = useState<string | null>(null);

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchTables = async () => {
    try {
      const { data } = await axios.get<Table[]>(`${import.meta.env.VITE_API_URL}/tables`, config);
      setTables(data);
    } catch (err: any) {
      console.error('Error fetching tables:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch tables');
    }
  };

  const fetchReservations = async () => {
    try {
      const { data } = await axios.get<Reservation[]>(`${import.meta.env.VITE_API_URL}/reservations`, config);
      setReservations(data);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch reservations');
    }
  };

  useEffect(() => {
    if (restaurantId && token) {
      setLoading(true);
      Promise.all([fetchTables(), fetchReservations()])
        .finally(() => setLoading(false));
    }
  }, [restaurantId, token]);

  // Table Management Handlers
  const handleSaveTable = async (tableData: Omit<Table, '_id' | 'isAvailable'>) => {
    setTableCrudError(null);
    try {
      if (editingTable) {
        await axios.put(`${import.meta.env.VITE_API_URL}/tables/${editingTable._id}`, tableData, config);
        toast.success('Table updated successfully!');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/tables`, tableData, config);
        toast.success('Table added successfully!');
      }
      fetchTables();
      setShowTableForm(false);
      setEditingTable(undefined);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save table';
      setTableCrudError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setShowTableForm(true);
  };

  const handleDeleteTable = (tableId: string) => {
    setTableToDeleteId(tableId);
    setIsConfirmTableModalOpen(true);
  };

  const confirmDeleteTable = async () => {
    if (tableToDeleteId) {
      setTableCrudError(null);
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/tables/${tableToDeleteId}`, config);
        toast.success('Table removed!');
        fetchTables();
        fetchReservations(); // Refresh reservations as well
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to delete table';
        setTableCrudError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsConfirmTableModalOpen(false);
        setTableToDeleteId(null);
      }
    }
  };

  const cancelDeleteTable = () => {
    setIsConfirmTableModalOpen(false);
    setTableToDeleteId(null);
  };

  // Reservation Management Handlers
  const handleSaveReservation = async (reservationData: any) => {
    try {
      if (editingReservation) {
        await axios.put(`${import.meta.env.VITE_API_URL}/reservations/${editingReservation._id}`, reservationData, config);
        toast.success('Reservation updated successfully!');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/reservations`, { ...reservationData, restaurantId }, config);
        toast.success('Reservation added successfully!');
      }
      fetchReservations();
      fetchTables(); // Refresh tables as status might change
      setShowReservationForm(false);
      setEditingReservation(undefined);
    } catch (err: any) {
      console.error('Error saving reservation:', err);
      toast.error(err.response?.data?.message || 'Failed to save reservation');
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setShowReservationForm(true);
  };

  const handleDeleteReservation = (reservationId: string) => {
    setReservationToDeleteId(reservationId);
    setIsConfirmReservationModalOpen(true);
  };

  const confirmDeleteReservation = async () => {
    if (reservationToDeleteId) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/reservations/${reservationToDeleteId}`, config);
        toast.success('Reservation removed!');
        fetchReservations();
        fetchTables(); // Refresh tables as status might change
      } catch (err: any) {
        console.error('Error deleting reservation:', err);
        toast.error(err.response?.data?.message || 'Failed to delete reservation');
      } finally {
        setIsConfirmReservationModalOpen(false);
        setReservationToDeleteId(null);
      }
    }
  };

  const cancelDeleteReservation = () => {
    setIsConfirmReservationModalOpen(false);
    setReservationToDeleteId(null);
  };

  const handleUpdateReservationStatus = async (reservationId: string, newStatus: Reservation['status']) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/reservations/${reservationId}`, { status: newStatus }, config);
      toast.success('Reservation status updated!');
      fetchReservations();
      fetchTables(); // Refresh tables as status might change
    } catch (err: any) {
      console.error('Error updating reservation status:', err);
      toast.error(err.response?.data?.message || 'Failed to update reservation status');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading management data...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <ConfirmationModal
        isOpen={isConfirmTableModalOpen}
        onClose={cancelDeleteTable}
        onConfirm={confirmDeleteTable}
        title="Confirm Table Deletion"
        message="Are you sure you want to delete this table? This action cannot be undone."
      />
      <ConfirmationModal
        isOpen={isConfirmReservationModalOpen}
        onClose={cancelDeleteReservation}
        onConfirm={confirmDeleteReservation}
        title="Confirm Reservation Deletion"
        message="Are you sure you want to delete this reservation? This action cannot be undone."
      />

      {/* Table Management Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-poppins font-bold text-xl text-accent-charcoal">
            Table Management
          </h2>
          {tableCrudError && (
            <div className="text-red-500 text-sm mt-2">{tableCrudError}</div>
          )}
          <button
            onClick={() => {
              setEditingTable(undefined);
              setShowTableForm(true);
              setTableCrudError(null);
            }}
            className="bg-gradient-teal-cyan text-white px-6 py-3 rounded-xl font-inter font-semibold hover:shadow-lg transition-shadow flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Table</span>
          </button>
        </div>

        {showTableForm && (
          <TableForm
            table={editingTable}
            onSave={handleSaveTable}
            onCancel={() => {
              setShowTableForm(false);
              setEditingTable(undefined);
              setTableCrudError(null);
            }}
          />
        )}

        <TableList tables={tables} onEdit={handleEditTable} onDelete={handleDeleteTable} />
      </div>

      {/* Reservation Management Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-poppins font-bold text-xl text-accent-charcoal">
            Reservation Management
          </h2>
          <button
            onClick={() => {
              setEditingReservation(undefined);
              setShowReservationForm(true);
            }}
            className="bg-gradient-teal-cyan text-white px-6 py-3 rounded-xl font-inter font-semibold hover:shadow-lg transition-shadow flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Reservation</span>
          </button>
        </div>

        {showReservationForm && (
          <ReservationForm
            reservation={editingReservation}
            onSave={handleSaveReservation}
            onCancel={() => {
              setShowReservationForm(false);
              setEditingReservation(undefined);
            }}
            availableTables={tables.filter(t => t.isAvailable || (editingReservation && editingReservation.table && t._id === editingReservation.table._id))}
          />
        )}

        <ReservationList
          reservations={reservations}
          onEdit={handleEditReservation}
          onDelete={handleDeleteReservation}
          onUpdateStatus={handleUpdateReservationStatus}
        />
      </div>
    </div>
  );
};

export default TableManagement;
