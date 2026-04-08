import { Component, OnInit, signal } from '@angular/core';
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
  bookingId!: number;
  showId!: number;
  finalAmount = 0;
  timeLeft = signal(300); // 10 minutes in seconds (10 * 60)
  displayTime: string = '05:00';
  timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentGatewayService
  ) { }

  ngOnInit() {
    // ✅ FIXED: Changed paramMap to queryParamMap
    this.bookingId = Number(this.route.snapshot.queryParamMap.get('bookingId'));

    // Get query params passed from Payment Page
    this.showId = Number(this.route.snapshot.queryParamMap.get('showId'));
    this.finalAmount = Number(this.route.snapshot.queryParamMap.get('totalAmount'));

    this.startTimer();
  }


  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft() > 0) {
        this.timeLeft.set(this.timeLeft() - 1);
        this.updateDisplayTime();
      } else {
        this.handleTimeOut(); // Time khatam hone par yeh function chalega
      }
    }, 1000); // 1000ms = 1 second
  }

  updateDisplayTime() {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;

    // Format set karna: Agar number 10 se kam hai toh aage '0' lagana (e.g., 09)
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    this.displayTime = `${formattedMinutes}:${formattedSeconds}`;
  }

  handleTimeOut() {
    clearInterval(this.timerInterval);
    alert('⏱️ Session Expired! Please select your seats again.');

    // User ko wapas Home ya Movies page par bhej dein
    this.router.navigate(['/home']);
  }

  // Common booking API call with selected payment mode
  completeBooking(paymentMode: string) {
    if (!this.bookingId || this.bookingId === 0) {
      alert('Error: Booking ID is missing. Please restart your booking.');
      return;
    }

    // Step 2: Payment (Booking is ALREADY PENDING). Go straight to checkout session!
    this.paymentService.createCheckoutSession(this.bookingId, this.finalAmount, this.showId).subscribe({
      next: (response) => {
        window.location.href = response.checkoutUrl;
        alert('Seats are booked');
      },
      error: (err) => {
        console.error("Checkout Session Error:", err);
        alert('Could not start checkout session');
      }
    });
  }
}
