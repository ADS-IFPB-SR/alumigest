import React, { useState } from 'react';

interface TabProps {
  readonly label: string;
  readonly children: React.ReactNode;
  readonly dataCy?: string;
}

interface TabsProps {
  readonly children: React.ReactElement<TabProps>[];
  readonly defaultIndex?: number;
  readonly rightSlot?: React.ReactNode;
}

export function Tabs({ children, defaultIndex = 0, rightSlot }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden h-full">

      {/* Horizontal Tabs + Optional Right Slot */}
      <div className="border-b border-outline-variant mb-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-xs flex-none">
        <div className="flex overflow-x-auto no-scrollbar scrollbar-none gap-xs">
          {React.Children.map(children, (child, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                type="button"
                data-cy={child.props.dataCy}
                onClick={() => setActiveIndex(index)}
                className={`px-md py-2 font-label text-sm whitespace-nowrap transition-all border-b-2 font-medium cursor-pointer ${
                  isActive
                    ? 'text-primary border-primary font-bold bg-surface-container rounded-t-md'
                    : 'text-secondary border-transparent hover:text-primary hover:bg-surface-container-high'
                }`}
              >
                {child.props.label}
              </button>
            );
          })}
        </div>

        {rightSlot && (
          <div className="flex flex-wrap items-center gap-xs pb-xs xl:pb-0">
            {rightSlot}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {React.Children.toArray(children)[activeIndex]}
      </div>
    </div>
  );
}

export function Tab({ children, label: _label, dataCy: _dataCy }: Readonly<TabProps>) {
  return <>{children}</>;
}
