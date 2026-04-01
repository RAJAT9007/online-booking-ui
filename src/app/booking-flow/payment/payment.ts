import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css']
})
export class Payment implements OnInit {

  showId: number = 0;
  selectedSeats: any[] = []; // Now populated from the SeatBooking navigation

  seatTotal = 0;
  convenienceFee = 0;
  gst = 0;
  finalAmount = 0;

  isLoading = false;
  userId: number | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private paymentService: PaymentService
  ) { }

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap;
    const idFromUrl = q.get('showId');
    const seatsFromUrl = q.get('seatIds'); // Receives comma-separated string from SeatBooking

    if (idFromUrl) {
      this.showId = Number(idFromUrl);
    } else {
      console.error("🚨 Show ID is missing!");
    }

    // Logic to handle seat selection passed from the booking page
    if (seatsFromUrl) {
      // In a real app, you might want to fetch full seat details from backend here
      // For now, we simulate the objects based on IDs passed
      const ids = seatsFromUrl.split(',');
      // Note: If you passed 'amount' in queryParams, use that, otherwise calculate:
      const totalFromUrl = q.get('amount');
      if (totalFromUrl) {
        this.seatTotal = Number(totalFromUrl);
        this.calculateAmount(ids.length);
      }
    }

    this.userId = Number(localStorage.getItem('userId'));
  }

  calculateAmount(seatCount: number) {
    // seatTotal is already set from queryParams in this logic
    this.convenienceFee = seatCount * 20;
    this.gst = this.convenienceFee * 0.18;
    this.finalAmount = this.seatTotal + this.convenienceFee + this.gst;
  }

  /**
   * Final Booking Logic (Production Ready)
   * This uses your commented-out logic but cleaned up.
   */

  payNow() {
    if (this.isLoading) return;
    this.isLoading = true;

    const seatIdsParam = this.route.snapshot.queryParamMap.get('seatIds');
    const seatIds = seatIdsParam ? seatIdsParam.split(',').map(id => Number(id)) : [];

    if (seatIds.length === 0) {
      alert('Please select seats');
      this.isLoading = false;
      return;
    }

    const payload = {
      userId: this.userId!,
      showId: this.showId,
      seatIds: seatIds,
      totalAmount: this.seatTotal,
      idempotencyKey: crypto.randomUUID()
    };

    this.paymentService.createBooking(payload).subscribe({
      next: (res) => {
        console.log('✅ Booking Success:', res);

        const bookingId = res?.bookingId || res?.id;

        // 👉 After booking → go to confirmation (recommended)
        this.router.navigate(['/payment-gateway'], {
          queryParams: {
            bookingId,
            userId: this.userId
          }
        });
      },
      error: (err) => {
        console.error('❌ Booking failed:', err);
        alert('Booking failed, try again');
        this.isLoading = false;
      }
    });
  }
  // payNow() {
  //   // 1. Prevent multiple clicks
  //   if (this.isLoading) return;
  //   this.isLoading = true;

  //   // 2. Safely extract and convert seat IDs
  //   const seatIdsParam = this.route.snapshot.queryParamMap.get('seatIds');
  //   const seatIds = seatIdsParam ? seatIdsParam.split(',').map(id => Number(id)) : [];

  //   if (seatIds.length === 0) {
  //     console.warn('No seats selected for booking.');
  //     alert('Please select at least one seat before proceeding.');
  //     this.isLoading = false;
  //     return;
  //   }

  //   // 3. Construct the payload
  //   const bookingPayload = {
  //     userId: this.userId, // must be > 0
  //     showId: this.showId,
  //     seatIds: seatIds,
  //     totalAmount: this.seatTotal, // must match backend calculation
  //     idempotencyKey: crypto.randomUUID() // required field to prevent duplicate charges
  //   };

  //   // 4. Make the API call
  //   this.http.post<any>('http://localhost:8082/api/bookings/create', bookingPayload)
  //     .subscribe({
  //       next: (response) => {
  //         console.log('SUCCESS: Backend returned:', response);

  //         // Safely extract the ID (handles if your Java backend sends 'bookingId' or just 'id')
  //         const idToRoute = response?.bookingId || response?.id;

  //         if (!idToRoute) {
  //           console.error('ERROR: Could not find a valid ID in the backend response.', response);
  //           alert('Booking was created, but we could not redirect you to payment. Please check your tickets.');
  //           this.isLoading = false;
  //           return;
  //         }

  //         // Route to the payment gateway
  //         this.router.navigate(['/payment-gateway', idToRoute]).then(navigationSuccess => {
  //           if (!navigationSuccess) {
  //             console.error('Routing failed! Check if your app-routing.module.ts has path: "payment-gateway/:id"');
  //           }
  //           // Reset loading state after routing attempt finishes
  //           this.isLoading = false;
  //         });
  //       },
  //       error: (err) => {
  //         console.error('Booking API failed:', err);
  //         alert('Booking failed. Please check your connection and try again.');
  //         // Always reset loading state on error
  //         this.isLoading = false;
  //       }
  //     });
  // }

  // payNow() {
  //   // Skip the HTTP request entirely and just route with a fake ID
  //   console.log('Skipping backend, going straight to payment...');
  //   this.router.navigate(['/payment-gateway', 'test-booking-123']);
  // }

}