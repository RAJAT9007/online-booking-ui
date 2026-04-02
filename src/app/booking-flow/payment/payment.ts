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
  selectedSeats: any[] = [];

  seatTotal = 0;
  convenienceFee = 0;
  gst = 0;
  finalAmount = 0;

  isLoading = false;


  // ✅ Holding the numeric user ID
  userId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private paymentService: PaymentService
  ) { }

  // ✅ Safely decodes the JWT and extracts the numeric userId
  getUserIdFromToken(): number {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      console.error("❌ No token found in localStorage");
      return 0;
    }

    try {
      // 1. Get the payload part of the token
      const base64Url = token.split('.')[1];

      // 2. Convert Base64Url to standard Base64 to prevent atob() crashes
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      // 3. Decode and parse the JSON
      const payload = JSON.parse(window.atob(base64));

      // eslint-disable-next-line no-console
      console.log("🔍 Decoded JWT Payload:", payload);

      // 4. Extract the userId. 
      // Note: Spring Boot MUST inject this into the token using .claim("userId", user.getId())
      const extractedId = payload.userId;

      return extractedId ? Number(extractedId) : 0;

    } catch (e) {
      console.error("❌ Invalid token formatting", e);
      return 0;
    }
  }

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap;

    const idFromUrl = q.get('showId');
    const seatsFromUrl = q.get('seatIds');
    const totalFromUrl = q.get('amount');

    // ✅ Set Show ID
    if (idFromUrl) {
      this.showId = Number(idFromUrl);
    } else {
      console.error("🚨 Show ID is missing!");
    }

    // ✅ Get userId from JWT on page load
    this.userId = this.getUserIdFromToken();
    // eslint-disable-next-line no-console
    console.log("✅ Logged in User ID:", this.userId);

    // ✅ Seat + Amount Handling
    if (seatsFromUrl) {
      const ids = seatsFromUrl.split(',');

      if (totalFromUrl) {
        this.seatTotal = Number(totalFromUrl);
        this.calculateAmount(ids.length);
      }
    }

  }


  calculateAmount(seatCount: number) {
    this.convenienceFee = seatCount * 20;
    this.gst = this.convenienceFee * 0.18;
    this.finalAmount = this.seatTotal + this.convenienceFee + this.gst;
  }

  // ✅ Prevents recreating the booking if they click back from Payment Gateway
  pendingBookingId: number | null = null;

  // ✅ Booking + Payment Flow
  payNow() {
    if (this.isLoading) return;

    if (this.pendingBookingId) {
      // If we already successfully created a pending booking moments ago,
      // do not trigger a 409 DB error! Just route them instantly!
      this.router.navigate(['/payment-gateway'], {
        queryParams: {
          bookingId: this.pendingBookingId,
          showId: this.showId,
          totalAmount: this.finalAmount
        }
      });
      return;
    }

    this.isLoading = true;

    const seatIdsParam = this.route.snapshot.queryParamMap.get('seatIds');
    const seatIds = seatIdsParam
      ? seatIdsParam.split(',').map(id => Number(id))
      : [];

    if (seatIds.length === 0) {
      alert('Please select seats');
      this.isLoading = false;
      return;
    }

    // ✅ Check if the ID is 0 or invalid
    if (!this.userId) {
      alert("User not logged in ❌");
      this.isLoading = false;
      return;
    }

    // ✅ Construct the payload using the numeric userId
    const payload = {
      userId: this.userId,
      showId: this.showId,
      seatIds: seatIds,
      totalAmount: this.seatTotal,
      // Safe fallback for idempotency key if crypto is blocked
      idempotencyKey: (window.crypto && window.crypto.randomUUID)
        ? window.crypto.randomUUID()
        : 'txn_' + new Date().getTime()
    };

    // eslint-disable-next-line no-console
    console.log("📦 Booking Payload:", payload);

    this.paymentService.createBooking(payload).subscribe({
      next: (res: any) => {
        // eslint-disable-next-line no-console
        console.log('✅ Booking Success:', res);

        const bookingId = res?.bookingId || res?.id;
        this.pendingBookingId = bookingId;

        // Route dynamically to /payment-gateway as requested
        this.router.navigate(['/payment-gateway'], {
          queryParams: {
            bookingId: bookingId,
            showId: this.showId,
            totalAmount: this.finalAmount
          }
        });
      },
      error: (err: any) => {
        console.error('❌ Booking failed:', err);
        alert('Booking failed, try again');
        this.isLoading = false;
      }
    });
  }
}