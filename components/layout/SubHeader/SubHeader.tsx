import { FC } from 'react';
import { SubHeaderProps } from './types';

/**
 * SubHeader Component for Varekatalog
 * 
 * Displays the organization branding line: "Varekatalog for Løvenskiold Logistikk levert av Byggern"
 * Height: 36px as specified in design requirements
 */
export const SubHeader: FC<SubHeaderProps> = ({ 
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`
        h-9 
        bg-neutral-50 
        border-b border-neutral-200
        flex items-center
        px-6
        ${className}
      `}
      {...props}
    >
      <span className="text-sm text-neutral-700 font-medium">
        Varekatalog for Løvenskiold Logistikk levert av Byggern
      </span>
    </div>
  );
};