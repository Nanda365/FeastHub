import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  vehicleType?: string;
  licensePlate?: string;
  deliveryPartnerId?: string;
}

const DeliveryPartnerListPage: React.FC = () => {
  const { token } = useAuth();
  const [deliveryPartners, setDeliveryPartners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliveryPartners = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/delivery-partners/active`,
          config
        );
        setDeliveryPartners(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch active delivery partners');
        toast.error(err.response?.data?.message || 'Failed to fetch active delivery partners');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDeliveryPartners();
    }
  }, [token]);

  if (loading) return <div className="text-center py-8">Loading active delivery partners...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-poppins font-bold text-3xl text-accent-charcoal mb-6">
        Active Delivery Partners
      </h1>
      {deliveryPartners.length === 0 ? (
        <p className="text-gray-600">No active delivery partners found.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vehicle Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    License Plate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryPartners.map((partner) => (
                  <tr key={partner._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {partner.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {partner.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {partner.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {partner.vehicleType || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {partner.licensePlate || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnerListPage;
