import React from 'react';

interface LoadingStateProps {
  title?: string;
  description?: string;
  fullHeight?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Loading...',
  description = 'Please wait while we fetch the data.',
  fullHeight = false,
}) => {
  const containerClass = fullHeight 
    ? 'h-screen flex items-center justify-center' 
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-border"></div>
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/50 animate-spin"
            style={{ animationDuration: '1s' }}
          ></div>
        </div>

        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};
