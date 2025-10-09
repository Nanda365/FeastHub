import React, { useState, useEffect } from 'react';

interface Table {
  _id?: string;
  tableNumber: string;
  seatingCapacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  amount: number;
}

interface TableFormProps {
  table?: Table; // Optional, for editing existing table
  onSave: (tableData: Omit<Table, '_id'>) => void;
  onCancel: () => void;
}

const TableForm: React.FC<TableFormProps> = ({ table, onSave, onCancel }) => {

  const [tableNumber, setTableNumber] = useState(table?.tableNumber || '');
  const [seatingCapacity, setSeatingCapacity] = useState(table?.seatingCapacity || 2);
  const [status, setStatus] = useState<Table['status']>(table?.status || 'available');
  const [amount, setAmount] = useState(table?.amount || 0);

  useEffect(() => {
    if (table) {
      setTableNumber(table.tableNumber);
      setSeatingCapacity(table.seatingCapacity);
      setStatus(table.status);
      setAmount(table.amount || 0);
    } else {
      // Reset form when there is no table prop (i.e., for creating a new table)
      setTableNumber('');
      setSeatingCapacity(2); // Default value
      setStatus('available');
      setAmount(0);
    }
  }, [table]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ tableNumber, seatingCapacity, status, amount });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="font-poppins font-semibold text-lg text-accent-charcoal mb-4">
        {table ? 'Edit Table' : 'Add New Table'}
      </h3>
      <form onSubmit={handleSubmit}>

        <div className="mb-4">
          <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700">Table Number</label>
          <input
            type="text"
            id="tableNumber"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="seatingCapacity" className="block text-sm font-medium text-gray-700">Seating Capacity</label>
          <input
            type="number"
            id="seatingCapacity"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
            value={seatingCapacity}
            onChange={(e) => setSeatingCapacity(parseInt(e.target.value) || 0)}
            min="1"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id="amount"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            min="0"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
            value={status}
            onChange={(e) => setStatus(e.target.value as Table['status'])}
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </select>
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
            {table ? 'Update Table' : 'Add Table'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TableForm;
