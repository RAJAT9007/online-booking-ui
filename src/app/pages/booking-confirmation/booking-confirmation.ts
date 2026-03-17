import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-confirmation.html',
  styleUrls: ['./booking-confirmation.css']
})
export class BookingConfirmationComponent implements OnInit {

  booking: any = null;
  bookedSeats: any[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadBooking(id);
  }

  loadBooking(id: any) {
    this.http.get<any>(
      `http://localhost:8082/api/bookings/${id}`)
      .subscribe({
        next: (data) => {
          this.booking = data;
          this.isLoading = false;
          this.loadBookedSeats(data.id);
        },
        error: () => this.isLoading = false
      });
  }

  loadBookedSeats(bookingId: number) {
    this.http.get<any[]>(
      `http://localhost:8082/api/bookingseats/booking/${bookingId}`)
      .subscribe(data => this.bookedSeats = data);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  printTicket() {
    window.print();
  }
}