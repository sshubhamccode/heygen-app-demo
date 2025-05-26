import React from 'react';
import { Clock } from 'lucide-react';

interface MinutesTrackerProps {
  remainingMinutes: number;
  onPurchaseMore: () => void;
}

export const MinutesTracker: React.FC<MinutesTrackerProps> = ({
  remainingMinutes,
  onPurchaseMore,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Processing Minutes</h3>
            <p className="text-slate-600">
              {remainingMinutes} {remainingMinutes === 1 ? 'minute' : 'minutes'} remaining
            </p>
          </div>
        </div>
        <button
          onClick={onPurchaseMore}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Purchase More
        </button>
      </div>
      
      {remainingMinutes < 10 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-700 text-sm">
            Your remaining minutes are running low. Consider purchasing more to continue processing videos.
          </p>
        </div>
      )}
    </div>
  );
};