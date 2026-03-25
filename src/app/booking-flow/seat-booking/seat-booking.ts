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

  showId!: number;
  screenId!: number;
  date = '';
  time = '';
  pricePerSeat = 120;

  seats: any[] = [];
  rows: any[] = [];
  bookedSeatIds: number[] = [];
  selectedSeats: any[] = [];

  isLoading = true;

  private apiUrl = 'http://localhost:8082';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders().set('Authorization', 'Bearer ' + token);
  }

  ngOnInit() {
    this.showId = Number(this.route.snapshot.queryParamMap.get('showId'));
    this.screenId = Number(this.route.snapshot.queryParamMap.get('screenId'));
    this.date = this.route.snapshot.queryParamMap.get('date') || '';
    this.time = this.route.snapshot.queryParamMap.get('time') || '';
    const price = this.route.snapshot.queryParamMap.get('price');
    if (price) this.pricePerSeat = Number(price);

    this.loadSeats();
    this.loadBookedSeats();
  }

  loadSeats() {
    this.http.get<any[]>(`${this.apiUrl}/api/seats/screen/${this.screenId}`, {
      headers: this.getHeaders()
    }).subscribe(seats => {
      this.seats = seats;
      this.groupSeats();
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  loadBookedSeats() {
    this.http.get<number[]>(`${this.apiUrl}/api/bookings/booked-seats/${this.showId}`, {
      headers: this.getHeaders()
    }).subscribe(ids => {
      this.bookedSeatIds = ids;
    });
  }

  groupSeats() {
    const map: any = {};
    this.seats.forEach(seat => {
      if (!map[seat.rowName]) map[seat.rowName] = [];
      map[seat.rowName].push(seat);
    });

    this.rows = Object.keys(map).sort().map(row => ({
      rowName: row,
      seats: map[row].sort((a: any, b: any) => a.seatNumber - b.seatNumber)
    }));
  }

  getSeatClass(seat: any) {
    if (this.bookedSeatIds.includes(seat.id)) return 'booked';
    if (this.selectedSeats.find(s => s.id === seat.id)) return 'selected';
    if (seat.seatType === 'RECLINER') return 'recliner';
    if (seat.seatType === 'GOLD') return 'gold';
    return 'silver';
  }

  toggleSeat(seat: any) {
    if (this.bookedSeatIds.includes(seat.id)) return;

    const index = this.selectedSeats.findIndex(s => s.id === seat.id);
    if (index > -1) this.selectedSeats.splice(index, 1);
    else this.selectedSeats.push(seat);
  }

  get totalAmount() {
    return this.selectedSeats.reduce((sum, s) => sum + (s.price || this.pricePerSeat), 0);
  }

  proceed() {
    this.router.navigate(['/payment'], {
      queryParams: {
        showId: this.showId,
        seatIds: this.selectedSeats.map(s => s.id).join(','),
        amount: this.totalAmount
      }
    });
  }
}