import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, throwError, map } from "rxjs";
import { Router } from "@angular/router";

export interface SeatResponse {
    id: number;
    rowName: string;
    seatNumber: string;
    seatType: string;
    price: number;
    isActive: boolean;
    screenId: number;
}

export interface SeatRow {
    rowName: string;
    seats: SeatResponse[];
}

@Injectable({ providedIn: 'root' })
export class SeatService {

    private seatApi = "http://localhost:8082/api/seats";
    private bookingApi = "http://localhost:8082/api/bookings";

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }


    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem("jwtToken");

        if (!token) {
            console.warn("⚠️ No JWT token found. Redirecting to login.");
            this.router.navigate(['/login']);
        }

        return new HttpHeaders({
            'Authorization': `Bearer ${token ?? ''}`,
            'Content-Type': 'application/json'
        });
    }


    private handleError(err: HttpErrorResponse): Observable<never> {
        let message = 'An unexpected error occurred.';

        if (err.status === 0) {
            message = 'Cannot reach the server. Is the backend running on port 8082?';
        } else if (err.status === 401) {
            message = 'Session expired. Please log in again.';
            localStorage.removeItem('jwtToken');
            this.router.navigate(['/login']);
        } else if (err.status === 403) {
            message = 'You do not have permission to access this resource.';
        } else if (err.status === 404) {
            message = `Resource not found: ${err.url}`;
        } else if (err.status >= 500) {
            message = 'Server error. Please try again later.';
        }

        console.error(`❌ HTTP ${err.status} — ${err.url}`, err);
        return throwError(() => new Error(message));
    }


    getSeats(screenId: number): Observable<SeatResponse[]> {
        return this.http.get<SeatResponse[]>(
            `${this.seatApi}/screen/${screenId}`,
            { headers: this.getHeaders() }
        ).pipe(catchError(err => this.handleError(err)));
    }

    getBookedSeats(showId: number): Observable<number[]> {
        return this.http.get<number[]>(
            `${this.bookingApi}/booked-seats/${showId}`,
            { headers: this.getHeaders() }
        ).pipe(catchError(err => this.handleError(err)));
    }

    generateSeats(screenId: number): Observable<string> {
        return this.http.post(
            `${this.seatApi}/generate/${screenId}`,
            {},
            { headers: this.getHeaders(), responseType: 'text' }
        ).pipe(catchError(err => this.handleError(err)));
    }

    bulkUpdatePrice(screenId: number, seatType: string, price: number): Observable<string> {
        return this.http.put(
            `${this.seatApi}/screen/${screenId}/bulk-price`,
            { seatType, price },
            { headers: this.getHeaders(), responseType: 'text' }
        ).pipe(catchError(err => this.handleError(err)));
    }

    updateSeat(seatId: number, payload: { price?: number; isActive?: boolean }): Observable<SeatResponse> {
        return this.http.put<SeatResponse>(
            `${this.seatApi}/update/${seatId}`,
            payload,
            { headers: this.getHeaders() }
        ).pipe(catchError(err => this.handleError(err)));
    }

    disableSeat(seatId: number): Observable<SeatResponse> {
        return this.http.put<SeatResponse>(
            `${this.seatApi}/disable/${seatId}`,
            {},
            { headers: this.getHeaders() }
        ).pipe(catchError(err => this.handleError(err)));
    }

    enableSeat(seatId: number): Observable<SeatResponse> {
        return this.http.put<SeatResponse>(
            `${this.seatApi}/enable/${seatId}`,
            {},
            { headers: this.getHeaders() }
        ).pipe(catchError(err => this.handleError(err)));
    }


    groupByRow(seats: SeatResponse[]): SeatRow[] {
        const rowMap = new Map<string, SeatResponse[]>();

        seats.forEach(s => {
            if (!rowMap.has(s.rowName)) rowMap.set(s.rowName, []);
            rowMap.get(s.rowName)!.push(s);
        });

        return Array.from(rowMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([rowName, seats]) => ({
                rowName,
                seats: seats.sort((a, b) =>
                    parseInt(a.seatNumber.slice(1)) - parseInt(b.seatNumber.slice(1))
                )
            }));
    }
}