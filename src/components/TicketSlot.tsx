import { forwardRef } from 'react';
import { CardMetrics } from '../config/roulette';

interface TicketSlotProps {
  metrics: CardMetrics;
}

/**
 * Empty ticket shell. HorizontalRoulette positions it and writes its number
 * imperatively every frame (data-num / data-serial / data-tone), bypassing React renders.
 */
export const TicketSlot = forwardRef<HTMLDivElement, TicketSlotProps>(({ metrics }, ref) => (
  <div
    ref={ref}
    className="roulette-slot"
    data-tone="light"
    style={{
      width: metrics.width,
      height: metrics.height,
      marginTop: -metrics.height / 2,
      fontSize: metrics.width * 0.42
    }}
  >
    <div className="ticket-glow" />
    <div className="ticket">
      <div className="paper-texture" />
      <span data-serial className="ticket-serial" />
      <span data-num className="ticket-number font-scary" />
      <span className="ticket-barcode">||| | |||| | ||</span>
    </div>
  </div>
));

TicketSlot.displayName = 'TicketSlot';
