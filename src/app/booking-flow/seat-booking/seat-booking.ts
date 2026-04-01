import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { SeatService, SeatResponse, SeatRow } from '../../services/seat.service';
import { FormsModule } from '@angular/forms';

/**
 * SeatBooking — now fully backend-driven.
 * Removed all static seat generation.
 * Fetches seats + booked IDs from the backend in parallel.
 * Delegates rendering to the SeatLayoutComponent template approach.
 */
@Component({
  selector: 'app-seat-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seat-booking.html',
  styleUrls: ['./seat-booking.css']
})
export class SeatBooking implements OnInit {

  // ── Route Params ──────────────────────────────────────────────────────────
  showId!: number;
  screenId!: number;
  theatreId!: number;
  showDate: string = '';
  showTime: string = '';

  // ── State ──────────────────────────────────────────────────────────────────
  allSeats: SeatResponse[] = [];
  rowObjects: SeatRow[] = [];
  bookedSeatIds = new Set<number>();
  selectedSeatIds = new Set<number>();

  isLoading = signal(true);
  isProcessing = false;
  error = '';
  movietitle: string = '';
  theatrename: string = '';
  userId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private seatService: SeatService
  ) { }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.showId = Number(q.get('showId'));
    this.screenId = Number(q.get('screenId'));
    this.theatreId = Number(q.get('theatreId'));
    this.showDate = q.get('showDate') || '';
    this.showTime = q.get('showTime') || '';
    this.movietitle = q.get('movietitle') || '';
    this.theatrename = q.get('theatrename') || '';

    this.loadSeatLayout();
  }

  loadSeatLayout(): void {
    this.isLoading.set(true);
    this.error = '';

    // ✅ Fetch seats AND booked IDs simultaneously — no more nested subscribes
    forkJoin({
      seats: this.seatService.getSeats(this.screenId),
      booked: this.seatService.getBookedSeats(this.showId)
    }).subscribe({
      next: ({ seats, booked }) => {
        this.allSeats = seats;
        this.bookedSeatIds = new Set(booked);
        this.rowObjects = this.seatService.groupByRow(seats);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Seat layout load error:', err);
        this.error = 'Failed to load seat layout. Please try again.';
        this.isLoading.set(false);
      }
    });
  }

  // ── Seat State ────────────────────────────────────────────────────────────

  isBooked(seat: SeatResponse): boolean { return this.bookedSeatIds.has(seat.id); }
  isSelected(seat: SeatResponse): boolean { return this.selectedSeatIds.has(seat.id); }
  isDisabled(seat: SeatResponse): boolean { return !seat.isActive; }

  getSeatClass(seat: SeatResponse): string {
    if (this.isBooked(seat)) return 'booked';
    if (this.isDisabled(seat)) return 'disabled';
    if (this.isSelected(seat)) return 'selected';
    return seat.seatType.toLowerCase();   // 'premium' | 'gold' | 'silver'
  }

  toggleSeat(seat: SeatResponse): void {
    if (this.isBooked(seat) || this.isDisabled(seat)) return;
    if (this.selectedSeatIds.has(seat.id)) {
      this.selectedSeatIds.delete(seat.id);
    } else {
      this.selectedSeatIds.add(seat.id);
    }
  }

  removeSeat(seatId: number): void {
    this.selectedSeatIds.delete(seatId);
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  get selectedSeats(): SeatResponse[] {
    return this.allSeats.filter(s => this.selectedSeatIds.has(s.id));
  }

  get totalAmount(): number {
    return this.selectedSeats.reduce((sum, s) => sum + s.price, 0);
  }

  // ── Payment ──────────────────────────────────────────────────────────────────

  proceedToPayment(): void {
    if (this.selectedSeatIds.size === 0 || this.isProcessing) return;
    this.isProcessing = true;

    const seatIds = this.selectedSeats.map(s => s.id).join(',');

    this.router.navigate(['/payment'], {
      queryParams: { showId: this.showId, seatIds, amount: this.totalAmount, userId: this.userId }
    }).then(ok => { if (!ok) this.isProcessing = false; })
      .catch(() => { this.isProcessing = false; });
  }
}
