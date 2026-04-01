import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PaymentGatewayService {
    private api = 'http://localhost:8082/api/bookings';

    constructor(private http: HttpClient) { }

    private headers() {
        const token = localStorage.getItem('jwtToken');
        return {
            headers: new HttpHeaders({
                Authorization: `Bearer ${token}`
            })
        };
    }

    /**
     * Decodes the JWT payload and extracts the userId.
     * Assumes backend JWT contains a 'userId' or 'sub' claim.
     */
    private getUserIdFromToken(): number {
        const token = localStorage.getItem('jwtToken');
        if (!token) return 0;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Try 'userId' first, fall back to 'sub' (standard JWT subject)
            return payload.userId || Number(payload.sub) || 0;
        } catch (e) {
            console.error('Could not decode JWT token', e);
            return 0;
        }
    }

    completeBooking(showId: number, seatIds: number[], totalAmount: number, paymentMode: string) {
        const userId = this.getUserIdFromToken();

        return this.http.post<any>(
            `${this.api}/create`,
            {
                userId: userId,
                showId: showId,
                seatIds: seatIds,
                totalAmount: totalAmount,
                idempotencyKey: crypto.randomUUID(),
            },
            this.headers()
        );
    }

    getBookingById(bookingId: number) {
        return this.http.get<any>(`${this.api}/${bookingId}`, this.headers());
    }

    confirmBooking(bookingId: number) {
        return this.http.patch<any>(
            `${this.api}/${bookingId}/confirm`,
            {},
            this.headers()
        );
    }

    createCheckoutSession(bookingId: number, amount: number, showId: number) {
        return this.http.post<any>(
            `http://localhost:8082/api/payments/create-checkout-session`,
            { bookingId, amount, showId },
            this.headers()
        );
    }

    verifySession(sessionId: string, bookingId: number) {
        return this.http.post<any>(
            `http://localhost:8082/api/payments/verify-session?sessionId=${sessionId}&bookingId=${bookingId}`,
            {},
            this.headers()
        );
    }
}
