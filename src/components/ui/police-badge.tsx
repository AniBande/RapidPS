
import { cn } from '@/lib/utils';

interface PoliceBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}

const PoliceBadge = ({ className, size = 'md', withText = true }: PoliceBadgeProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Police Badge with Ashoka Chakra */}
      <div className={cn('relative', sizeClasses[size])}>
        {/* Badge shape */}
        <div className="absolute inset-0 bg-police-navy rounded-full border-2 border-police-gold"></div>
        
        {/* Ashoka Chakra */}
        <div className="absolute inset-[15%] border-2 border-police-gold rounded-full ashoka-chakra">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-police-gold font-bold">
              {size === 'sm' ? 'SAMARTH' : size === 'md' ? 'SAMARTH' : 'SAMARTH'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Text */}
      {withText && (
        <div className="flex flex-col">
          <span className="font-bold text-police-navy">SAMARTH</span>
          <span className="text-xs text-gray-600"></span>
        </div>
      )}
    </div>
  );
};

export default PoliceBadge;
