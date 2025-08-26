
import React from 'react';
import { X } from 'lucide-react';

interface Request {
  _id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  [key: string]: any; // Allow other properties
}

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  requestType: 'restaurant' | 'delivery';
  onNext: () => void;
  hasMoreRequests: boolean;
  onPrevious: () => void;
  hasPreviousRequests: boolean;
}

const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  requestType,
  onNext,
  hasMoreRequests,
  onPrevious,
  hasPreviousRequests,
}) => {
  if (!isOpen || !request) return null;

  const renderRequestDetails = () => {
    if (requestType === 'restaurant') {
      return (
        <>
          <p className="font-inter">
            <strong>Restaurant Name:</strong> {request.restaurantName}
          </p>
          <p className="font-inter">
            <strong>Restaurant Address:</strong> {request.restaurantAddress}
          </p>
        </>
      );
    } else {
      return (
        <>
          <p className="font-inter">
            <strong>Vehicle Type:</strong> {request.vehicleType}
          </p>
          <p className="font-inter">
            <strong>License Plate:</strong> {request.licensePlate}
          </p>
        </>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-poppins font-bold text-2xl text-accent-charcoal">
            {requestType === 'restaurant' ? 'Restaurant Request' : 'Delivery Request'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="font-inter">
            <strong>User Name:</strong> {request.userName}
          </p>
          <p className="font-inter">
            <strong>User Email:</strong> {request.userEmail}
          </p>
          <p className="font-inter">
            <strong>User Phone:</strong> {request.userPhone}
          </p>
          {renderRequestDetails()}
          <p className="font-inter">
            <strong>Status:</strong>{' '}
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                request.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : request.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {request.status}
            </span>
          </p>
          <p className="font-inter text-sm text-gray-500">
            <strong>Requested At:</strong> {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          {hasPreviousRequests && (
            <button
              onClick={onPrevious}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-inter font-medium hover:bg-gray-100 transition-colors"
            >
              Previous
            </button>
          )}
          <button
            onClick={() => onReject(request._id)}
            className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-xl font-inter font-medium hover:bg-red-500 hover:text-white transition-colors"
          >
            Reject
          </button>
          <button
            onClick={() => onApprove(request._id)}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-inter font-medium hover:bg-green-600 transition-colors"
          >
            Approve
          </button>
          {hasMoreRequests && (
            <button
              onClick={onNext}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-inter font-medium hover:bg-blue-600 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
