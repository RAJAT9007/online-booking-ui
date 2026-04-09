import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ShowService } from '../../services/show.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfileComponent implements OnInit {

  userBookings = signal<any[]>([]);
  userEmail: string = '';
  userId: number = 0;
  isLoading = signal<boolean>(true);

  constructor(
    private bookingService: BookingService,
    private showService: ShowService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userEmail = localStorage.getItem('email') || 'Unknown User';
    this.userId = Number(localStorage.getItem('userId')) || 0; // fallback if needed

    if (!this.userId) {
      // In case they don't have a specific userId format, parse token or assume 1 for dev
      this.userId = Number(localStorage.getItem('ownerId')) || 1;
    }

    this.fetchBookings();
  }

  fetchBookings() {
    this.bookingService.getUserBookingHistory(this.userId).subscribe({
      next: (res: any) => {
        const bookings = res.content ? res.content : res;
        this.userBookings.set(bookings);

        // Fetch show details for each booking
        this.userBookings().forEach((booking: any) => {
          this.showService.getShowById(booking.showId).subscribe((showRes: any) => {
            booking.resolvedMovieName = showRes.movie?.title || 'Unknown Movie';
            booking.resolvedShowTime = showRes.startTime || showRes.showTime || null;
          });
        });

        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error("Failed to load bookings", err);
        this.isLoading.set(false);
      }
    });
  }

  home() {
    this.router.navigate(['/home']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
