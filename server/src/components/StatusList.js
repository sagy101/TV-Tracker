import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

function StatusList({ 
  type, 
  count, 
  items, 
  isExpanded, 
  onToggle, 
  itemRenderer,
  description
}) {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-500',
          borderColor: 'border-green-200',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          label: 'Successfully found:'
        };
      case 'failure':
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          borderColor: 'border-red-200',
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          label: 'Failed:'
        };
      case 'info':
        return {
          icon: Info,
          iconColor: 'text-blue-500',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          label: 'Skipped:'
        };
      default:
        return {
          icon: Info,
          iconColor: 'text-gray-500',
          borderColor: 'border-gray-200',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          label: ''
        };
    }
  };

  const { icon: Icon, iconColor, borderColor, bgColor, textColor, label } = getTypeStyles();

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 text-sm border ${borderColor} rounded-lg px-3 py-2 hover:${bgColor} transition-colors w-full`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${textColor}`}>{count}</span>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-500 ml-auto" /> : <ChevronDown className="h-4 w-4 text-gray-500 ml-auto" />}
      </button>
      
      {isExpanded && (
        <div 
          className={`absolute z-10 w-full mt-1 border ${borderColor} rounded-lg ${bgColor} shadow-lg`}
        >
          {description && (
            <div className="px-3 py-2 border-b border-gray-200 text-sm text-gray-600">
              {description}
            </div>
          )}
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
                  {type === 'success' ? 'No shows successfully found' : 
                   type === 'failure' ? 'No shows failed' :
                   'No shows skipped'}
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
  type: PropTypes.oneOf(['success', 'failure', 'info']).isRequired,
  count: PropTypes.number.isRequired,
  items: PropTypes.array,
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  itemRenderer: PropTypes.func,
  description: PropTypes.string
};

export default StatusList; 