/**
 * @deprecated Use SeatResponse from seat.service.ts instead.
 * Kept for backward compatibility.
 */
export interface Seat {
    id: string;         // rowLetter + colNumber e.g. "A1"
    row: string;        // "A"
    number: number;     // 1
    type: string;       // "PREMIUM" | "GOLD" | "SILVER"
    price: number;
    booked: boolean;
    realDbId: number;   // actual DB seat.id
}