import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface Table {
  _id: string;
  tableNumber: string;
  seatingCapacity: number;
  isAvailable: boolean;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  amount: number;
}

interface TableListProps {
  tables: Table[];
  onEdit: (table: Table) => void;
  onDelete: (tableId: string) => void;
}

const TableList: React.FC<TableListProps> = ({ tables = [], onEdit, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-poppins font-semibold text-lg text-accent-charcoal mb-4">Existing Tables</h3>
      {tables.length === 0 ? (
        <p className="text-gray-600">No tables added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>

                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table No.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tables.map((table) => (
                <tr key={table._id}>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{table.tableNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{table.seatingCapacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{table.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${table.status === 'available' ? 'bg-green-100 text-green-800' : table.status === 'occupied' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {table.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onEdit(table)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(table._id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5" />
                    </button>
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

export default TableList;
