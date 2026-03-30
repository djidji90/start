// src/components/ui/VerifiedBadge.jsx
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const VerifiedBadge = ({ size = 'md', showTooltip = true }) => {
  const sizes = {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32
  };

  const iconSize = sizes[size] || sizes.md;

  return (
    <span 
      className="inline-flex items-center ml-1"
      title={showTooltip ? "Artista Verificado" : ""}
    >
      <FaCheckCircle 
        size={iconSize}
        className="text-blue-500 fill-current"
        style={{ color: '#3b82f6' }}
      />
    </span>
  );
};

export default VerifiedBadge;