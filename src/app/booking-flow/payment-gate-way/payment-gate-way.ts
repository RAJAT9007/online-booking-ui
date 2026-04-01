import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentGatewayService } from '../../services/paymentGateway.service';

@Component({
  selector: 'app-payment-gateway',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-gate-way.html',
  styleUrls: ['./payment-gate-way.css']
})
export class PaymentGateway implements OnInit {
  showId!: number;
  selectedSeats: any[] = [];
  finalAmount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentGatewayService
  ) { }

  ngOnInit() {
    // Get query params passed from Payment Page
    this.showId = Number(this.route.snapshot.queryParamMap.get('showId'));
    const seatsData = this.route.snapshot.queryParamMap.get('seats');
    this.selectedSeats = seatsData ? JSON.parse(seatsData) : [];
    this.finalAmount = Number(this.route.snapshot.queryParamMap.get('totalAmount'));


  }

  // Common booking API call with selected payment mode
  completeBooking(paymentMode: string) {
    // Check if we have the data we need
    if (!this.showId || this.showId === 0) {
      alert('Error: Show ID is missing. Please restart your booking.');
      return;
    }

    const seatIds = this.selectedSeats.map(s => s.id);
    if (seatIds.length === 0) {
      alert('No seats selected!');
      return;
    }

    // Step 1: Create booking (PENDING)
    this.paymentService.completeBooking(this.showId, seatIds, this.finalAmount, paymentMode)
      .subscribe({
        next: (booking: any) => {
          // Call your new Stripe backend endpoint
          this.paymentService.createCheckoutSession(booking.bookingId, this.finalAmount, this.showId).subscribe({
              next: (response) => {
                  window.location.href = response.checkoutUrl;
              },
              error: (err) => {
                  console.error("Checkout Session Error:", err);
                  alert('Could not start checkout session');
              }
          });
        },
        error: (err) => {
          console.error("Booking Creation Error:", err);
          alert('Could not create booking. Check if Show ID ' + this.showId + ' exists.');
        }
      });
  }
  // payNow() {

  //   this.isLoading = true;

  //   const seatIds =
  //     this.selectedSeats.map(s => s.id);

  //   this.http.post<any>(
  //     'http://localhost:8082/api/bookings/create',
  //     {
  //       showId: this.showId,
  //       seatIds: seatIds,
  //       totalAmount: this.finalAmount
  //     }
  //   ).subscribe({

  //     next: (booking) => {

  //       const options = {

  //         key: 'YOUR_RAZORPAY_KEY',
  //         amount: Math.round(this.finalAmount * 100),
  //         currency: 'INR',
  //         name: 'Book-Your VIBE',
  //         description: 'Movie Ticket Booking',

  //         handler: (response: any) => {

  //           this.http.post(
  //             'http://localhost:8082/api/payment/verify',
  //             {
  //               bookingId: booking.id,
  //               razorpayOrderId:
  //                 response.razorpay_order_id,
  //               razorpayPaymentId:
  //                 response.razorpay_payment_id,
  //               razorpaySignature:
  //                 response.razorpay_signature
  //             }
  //           ).subscribe({
  //             next: () => {
  //               this.router.navigate(
  //                 ['/booking-confirmation', booking.id]
  //               );
  //             },
  //             error: () => {
  //               alert('Payment verification failed');
  //               this.isLoading = false;
  //             }
  //           });

  //         },

  //         modal: {
  //           ondismiss: () => {
  //             this.http.put(
  //               `http://localhost:8082/api/bookings/cancel/${booking.id}`,
  //               {}
  //             ).subscribe();
  //             this.isLoading = false;
  //           }
  //         },

  //         theme: { color: '#e50914' }

  //       };

  //       const rzp = new (window as any).Razorpay(options);
  //       rzp.open();
  //     },

  //     error: () => {
  //       alert('Booking failed');
  //       this.isLoading = false;
  //     }

  //   });

  // }
}
