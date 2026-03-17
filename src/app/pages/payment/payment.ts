import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css']
})
export class PaymentComponent implements OnInit {

  showId!: number;
  seatIds: number[] = [];
  amount!: number;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.showId = Number(
      this.route.snapshot.queryParamMap.get('showId'));
    this.amount = Number(
      this.route.snapshot.queryParamMap.get('amount'));
    const seats = this.route.snapshot.queryParamMap.get('seatIds');
    this.seatIds = seats ? seats.split(',').map(Number) : [];
  }

  payNow() {
    this.isLoading = true;

    // Step 1 — Create booking
    this.http.post<any>(
      'http://localhost:8082/api/bookings/create', {
      showId: this.showId,
      seatIds: this.seatIds,
      totalAmount: this.amount
    }).subscribe({
      next: (booking) => {
        const options = {
          key: 'YOUR_RAZORPAY_KEY',
          amount: this.amount * 100,
          currency: 'INR',
          name: 'Book-Your VIBE',
          description: 'Movie Ticket Booking',
          image: '/logo.png',

          handler: (response: any) => {
            // Step 2 — Verify payment
            this.http.post(
              'http://localhost:8082/api/payment/verify', {
              bookingId: booking.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            }).subscribe({
              next: () => {
                this.router.navigate(
                  ['/booking-confirmation', booking.id]);
              },
              error: () => alert('Payment verification failed!')
            });
          },

          modal: {
            ondismiss: () => {
              this.isLoading = false;
              // Cancel booking if payment dismissed
              this.http.put(
                `http://localhost:8082/api/bookings/cancel/${booking.id}`,
                {}
              ).subscribe();
            }
          },
          theme: { color: '#e50914' }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Failed to create booking!');
      }
    });
  }
}