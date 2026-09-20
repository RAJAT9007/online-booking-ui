import { Component, OnInit, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class Bookings implements OnInit {
  bookings = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  currentPage = signal<number>(1);
  pageSize = signal<number>(6);
  bookingService: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchBookings();
  }

  get paginatedBookings() {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.bookings().slice(startIndex, startIndex + this.pageSize());
  }

  get totalPages() {
    return Math.ceil(this.bookings().length / this.pageSize());
  }

  nextPage() {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  getHeaders() {
    const token = localStorage.getItem('jwtToken');
    return { headers: new HttpHeaders().set('Authorization', 'Bearer ' + token) };
  }

  fetchBookings() {
    this.isLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/api/bookings?size=100`, this.getHeaders()).subscribe({
      next: (res) => {
        this.bookings.set(res.content || res);
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching bookings', err);
        this.isLoading.set(false);
      }
    });
  }

  cancelBooking(bookingId: number) {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;

    this.http.patch(`${environment.apiUrl}/api/bookings/${bookingId}/cancel`, {}, this.getHeaders()).subscribe({
      next: () => {
        alert('Booking cancelled successfully!');
        this.fetchBookings();
      },
      error: (err) => {
        console.error('Cancellation failed', err);
        alert(err.error?.message || 'Failed to cancel the booking');
      }
    });
  }
}
