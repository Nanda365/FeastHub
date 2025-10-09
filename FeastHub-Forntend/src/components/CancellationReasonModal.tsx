import React, { useState } from 'react';

interface CancellationReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const defaultReasons = [
  'Change of plans',
  'Found a different restaurant',
  'Booking mistake',
  'Not feeling well',
];

const CancellationReasonModal: React.FC<CancellationReasonModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    if (reason.trim()) {
      onConfirm(reason);
    } else {
      // Maybe show an error message
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="font-poppins font-bold text-xl text-accent-charcoal mb-4">Reason for Cancellation</h2>
        <div className="space-y-4">
          {defaultReasons.map((reason) => (
            <div key={reason} className="flex items-center">
              <input
                type="radio"
                id={reason}
                name="cancellationReason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="h-4 w-4 text-primary-orange border-gray-300 focus:ring-primary-orange"
              />
              <label htmlFor={reason} className="ml-3 block text-sm font-medium text-gray-700">
                {reason}
              </label>
            </div>
          ))}
          <div className="flex items-center">
            <input
              type="radio"
              id="other"
              name="cancellationReason"
              value="Other"
              checked={selectedReason === 'Other'}
              onChange={() => setSelectedReason('Other')}
              className="h-4 w-4 text-primary-orange border-gray-300 focus:ring-primary-orange"
            />
            <label htmlFor="other" className="ml-3 block text-sm font-medium text-gray-700">
              Other
            </label>
          </div>
          {selectedReason === 'Other' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please specify your reason"
              className="mt-2 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange"
              rows={3}
            />
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === 'Other' && !customReason.trim())}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationReasonModal;
