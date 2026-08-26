export interface Seat {
    id: string;
    row: string;
    number: number;
    type: string;
    price: number;
    booked: boolean;
    realDbId: number;
}