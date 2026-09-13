import React from 'react';
import { AlertCircle, CheckCircle, InfoIcon, AlertTriangle } from 'lucide-react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type: AlertType;
  title: string;
  message?: string;
  onClose?: () => void;
}

const alertConfig = {
  info: {
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    Icon: InfoIcon,
  },
  success: {
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    Icon: CheckCircle,
  },
  warning: {
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    Icon: AlertTriangle,
  },
  error: {
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    Icon: AlertCircle,
  },
};

export const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  const config = alertConfig[type];
  const Icon = config.Icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 flex items-start gap-3`}>
      <Icon className={`${config.textColor} flex-shrink-0 mt-0.5`} size={20} />
      <div className="flex-1">
        <h3 className={`${config.textColor} font-semibold`}>{title}</h3>
        {message && <p className="text-gray-300 text-sm mt-1">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
};
