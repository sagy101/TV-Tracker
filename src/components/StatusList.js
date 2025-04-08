import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

function StatusList({ 
  type, 
  count, 
  items, 
  isExpanded, 
  onToggle, 
  itemRenderer 
}) {
  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle2 : XCircle;
  const iconColor = isSuccess ? 'text-green-500' : 'text-red-500';
  const borderColor = isSuccess ? 'border-green-200' : 'border-red-200';
  const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
  const textColor = isSuccess ? 'text-green-600' : 'text-red-600';

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 text-sm border ${borderColor} rounded-lg px-3 py-2 hover:${isSuccess ? 'bg-green-50' : 'bg-red-50'} transition-colors w-full`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <span className="text-gray-600">{isSuccess ? 'Successfully found:' : 'Failed:'}</span>
        <span className={`font-medium ${textColor}`}>{count}</span>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-500 ml-auto" /> : <ChevronDown className="h-4 w-4 text-gray-500 ml-auto" />}
      </button>
      {isExpanded && (
        <div className={`absolute z-10 w-full mt-1 border ${borderColor} rounded-lg ${bgColor} shadow-lg`}>
          <div className="p-3 max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {items?.length > 0 ? (
                items.map((item, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    {itemRenderer ? itemRenderer(item) : item}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">
                  {isSuccess ? 'No shows successfully found' : 'No shows failed'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

StatusList.propTypes = {
  type: PropTypes.oneOf(['success', 'failure']).isRequired,
  count: PropTypes.number.isRequired,
  items: PropTypes.array,
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  itemRenderer: PropTypes.func
};

export default StatusList; 