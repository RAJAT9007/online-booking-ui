import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BookingService {

    private api = `${environment.apiUrl}/api/bookings`;

    constructor(private http: HttpClient) { }

    private headers() {
        const token = localStorage.getItem("jwtToken");

        return {
            headers: new HttpHeaders({
                Authorization: `Bearer ${token}`
            })
        };
    }

    createBooking(showId: number, seatIds: number[]) {
        return this.http.post(
            `${this.api}`,
            { showId, seatIds },
            this.headers()
        );
    }

    getUserBookingHistory(userId: number) {
        return this.http.get<any>(
            `${this.api}/users/${userId}`,
            this.headers()
        );
    }

    getAllBookings() {
        return this.http.get<any>(
            `${this.api}?size=100`,
            this.headers()
        );
    }

    cancelBooking(bookingId: number) {
        return this.http.patch<any>(
            `${this.api}/${bookingId}/cancel`,
            {},
            this.headers()
        );
    }

    getOwnerBookingHistory() {
        return this.http.get<any[]>(
            `${this.api}/owner-view`,
            this.headers() // This sends the JWT token
        );
    }
}