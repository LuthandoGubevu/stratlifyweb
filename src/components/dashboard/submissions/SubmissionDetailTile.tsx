
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card'; // Using Card for structure
import { cn } from '@/lib/utils';

interface SubmissionDetailTileProps {
  label: string;
  value?: string;
  icon: React.ReactNode;
  included: boolean; // To control appearance if module is present but has no specific value to show
}

export default function SubmissionDetailTile({
  label,
  value,
  icon,
  included,
}: SubmissionDetailTileProps) {
  return (
    <div
      className={cn(
        'w-[100px] h-[100px] rounded-lg shadow-sm border flex flex-col items-center justify-center p-2 text-center hover:shadow-md transition-shadow duration-200',
        included ? 'bg-card' : 'bg-muted/50 opacity-70'
      )}
    >
      <div className={cn("h-6 w-6 mb-1", included ? 'text-primary' : 'text-muted-foreground')}>
        {icon}
      </div>
      {included ? (
        value ? (
          <p className="text-xs font-medium truncate w-full" title={value}>
            {value}
          </p>
        ) : (
          <p className="text-xs font-medium text-green-600">Included</p>
        )
      ) : (
        <p className="text-xs font-medium text-muted-foreground">—</p>
      )}
      <p className="text-[10px] text-muted-foreground mt-auto leading-tight">
        {label}
      </p>
    </div>
  );
}
