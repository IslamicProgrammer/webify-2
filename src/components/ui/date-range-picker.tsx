'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({ dateRange, onDateRangeChange, placeholder = 'Pick a date range', className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button id="date" variant="outline" className={cn('w-[240px] justify-start text-left font-normal', !dateRange && 'text-muted-foreground')}>
            <Calendar className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={range => {
              onDateRangeChange(range);
              if (range?.from && range?.to) {
                setIsOpen(false);
              }
            }}
            numberOfMonths={2}
          />
          <div className="flex items-center justify-between border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDateRangeChange(undefined);
                setIsOpen(false);
              }}
            >
              Clear
            </Button>
            <Button size="sm" onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
