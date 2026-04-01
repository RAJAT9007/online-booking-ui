import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class BookingService {

    private api = "http://localhost:8082/api/bookings";

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

}