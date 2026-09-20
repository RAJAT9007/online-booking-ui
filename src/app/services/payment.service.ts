import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface BookingPayload {
    userId: number;
    showId: number;
    seatIds: number[];
    totalAmount: number;
    idempotencyKey: string;
    theatreId: number;
}

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    private apiUrl = `${environment.apiUrl}/api/bookings`;

    constructor(private http: HttpClient) { }

    createBooking(payload: BookingPayload): Observable<any> {
        const token = localStorage.getItem('jwtToken');

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.post(
            `${this.apiUrl}/create`,
            payload,
            { headers }
        );
    }
}