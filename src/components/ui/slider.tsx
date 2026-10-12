import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn('group relative flex h-8 w-full touch-none select-none items-center', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-white/12 shadow-[inset_0_1px_2px_rgba(0,0,0,0.34)] transition-[height,background-color] duration-200 group-hover:h-2.5 group-hover:bg-white/18">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-[#6f7cff] to-[#aab2ff] transition-[width] duration-75 ease-out" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-white/80 bg-white shadow-[0_7px_22px_rgba(0,0,0,0.34),0_0_0_5px_rgba(111,124,255,0.14)] transition-[transform,box-shadow,border-color] duration-150 ease-out will-change-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aab2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b12] active:scale-95 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
