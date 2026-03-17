import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seat-booking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seat-booking.html',
  styleUrls: ['./seat-booking.css']
})
export class SeatBooking implements OnInit {

  movieId!: number;
  date: string = '';
  time: string = '';
  screenId: number = 1;
  pricePerSeat: number = 120;

  seats: any[] = [];
  bookedSeatIds: number[] = [];
  selectedSeats: any[] = [];
  rows: { rowName: string, seats: any[] }[] = [];
  isLoading = true;

  private apiUrl = 'http://localhost:8082';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  // ✅ JWT token helper
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      this.router.navigate(['/login']);
    }
    return new HttpHeaders()
      .set('Authorization', 'Bearer ' + token);
  }

  ngOnInit() {
    this.movieId = Number(this.route.snapshot.paramMap.get('showId'));
    this.date = this.route.snapshot.queryParamMap.get('date') || '';
    this.time = this.route.snapshot.queryParamMap.get('time') || '';
    const screenId = this.route.snapshot.queryParamMap.get('screenId');
    const price = this.route.snapshot.queryParamMap.get('price');
    if (screenId) this.screenId = Number(screenId);
    if (price) this.pricePerSeat = Number(price);

    this.loadSeats();
  }

  // ✅ Load seats with JWT token
  loadSeats() {
    this.isLoading = true;
    this.http.get<any[]>(
      `${this.apiUrl}/api/seats/screen/${this.screenId}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (seats) => {
        this.seats = seats;
        this.groupSeatsByRow();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Seats error:', err.status);
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
        this.isLoading = false;
      }
    });
  }

  groupSeatsByRow() {
    const rowMap: { [key: string]: any[] } = {};
    this.seats.forEach(seat => {
      if (!rowMap[seat.rowName]) rowMap[seat.rowName] = [];
      rowMap[seat.rowName].push(seat);
    });
    this.rows = Object.keys(rowMap).sort().map(rowName => ({
      rowName,
      seats: rowMap[rowName].sort((a, b) =>
        Number(a.seatNumber) - Number(b.seatNumber))
    }));
  }

  getSeatStatus(seat: any): string {
    if (this.bookedSeatIds.includes(seat.id)) return 'booked';
    if (this.selectedSeats.find(s => s.id === seat.id)) return 'selected';
    if (seat.seatType === 'PREMIUM') return 'premium';
    return 'available';
  }

  toggleSeat(seat: any) {
    if (this.bookedSeatIds.includes(seat.id)) return;
    const index = this.selectedSeats.findIndex(s => s.id === seat.id);
    if (index > -1) {
      this.selectedSeats.splice(index, 1);
    } else {
      this.selectedSeats.push(seat);
    }
    this.cdr.detectChanges();
  }

  get totalAmount(): number {
    return this.selectedSeats.length * this.pricePerSeat;
  }

  proceedToPayment() {
    if (this.selectedSeats.length === 0) {
      alert('Please select at least one seat!');
      return;
    }
    this.router.navigate(['/payment'], {
      queryParams: {
        movieId: this.movieId,
        seatIds: this.selectedSeats.map(s => s.id).join(','),
        amount: this.totalAmount,
        date: this.date,
        time: this.time
      }
    });
  }

  // goBack() {
  //   this.router.navigate(['/schedule', this.movieId]);
  // }
}