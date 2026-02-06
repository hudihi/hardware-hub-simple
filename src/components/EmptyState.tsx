import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`}></i>
      <h5 className="mb-2">{title}</h5>
      {description && <p className="text-muted mb-3">{description}</p>}
      {action && (
        <button className="btn btn-primary btn-lg-mobile" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
