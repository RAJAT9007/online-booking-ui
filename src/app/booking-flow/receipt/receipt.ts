import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [DatePipe],
  templateUrl: './receipt.html',
  styleUrls: ['./receipt.css']
})
export class Receipt implements OnInit {

  bookingId: string | null = null;
  bookingData: any = null;
  isLoading = true;
  today = new Date();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id');
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (this.bookingId) {
      if (sessionId) {
        this.verifySession(sessionId, this.bookingId);
      } else {
        this.fetchBookingDetails(this.bookingId);
      }
    } else {
      this.isLoading = false;
      console.error('No Booking ID found in URL');
    }
  }

  verifySession(sessionId: string, bookingId: string) {
    this.isLoading = true;
    this.http.post<any>(`http://localhost:8082/api/payments/verify-session?sessionId=${sessionId}&bookingId=${bookingId}`, {}, this.getAuthHeaders())
      .subscribe({
        next: () => {
          this.fetchBookingDetails(bookingId);
        },
        error: (err) => {
          console.error('Payment verification failed', err);
          alert('Payment verification failed. Please contact support.');
          this.isLoading = false;
        }
      });
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  fetchBookingDetails(id: string) {
    this.isLoading = true;
    this.http.get<any>(`http://localhost:8082/api/bookings/${id}`, this.getAuthHeaders())
      .subscribe({
        next: (data) => {
          this.bookingData = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Could not fetch booking details', err);
          this.isLoading = false;
        }
      });
  }

  printReceipt(): void {
    window.print();
  }

}