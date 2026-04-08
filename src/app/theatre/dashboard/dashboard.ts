import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TheatreService } from '../../services/theatre.service';
import { ScreenService } from '../../services/screen.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  theatres: any[] = [];
  selectedTheatreId: number | null = null;

  // Metrics
  totalTheatres: number = 0;
  totalScreens: number = 0;
  activeShows: number = 0;
  totalSeatsAvailable: number = 0;
  todayBookings: number = 0;
  todayRevenue: number = 0;
  
  timeFilter: string = 'day';

  isLoading: boolean = false;
  viewingSeatLayoutForScreen: number | null = null;
  viewingMoviesForScreen: number | null = null;
  screens: never[] | undefined;

  constructor(
    private theatreService: TheatreService,
    private screenService: ScreenService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadTheatres();
  }

  loadTheatres() {
    const ownerId = Number(localStorage.getItem('ownerId'));
    const role = localStorage.getItem('role');

    // Basic validation: if there's no ownerId and they are an OWNER, they shouldn't see anything
    if (!ownerId && role === 'OWNER') {
      console.error("No Owner ID found in storage");
      this.theatres = [];
      this.totalTheatres = 0;
      return;
    }

    this.theatreService.getTheatres().subscribe({
      next: (res: any) => {
        // STRICT FILTER: If the user is an OWNER, only show their theatres.
        // If the user is an ADMIN, you might want to show all (res), 
        // otherwise, default to filtering by ownerId for safety.
        if (role === 'OWNER') {
          this.theatres = res.filter((t: any) => t.ownerId === ownerId);
        } else if (role === 'ADMIN') {
          this.theatres = res; // Admins see everything
        } else {
          this.theatres = []; // Unknown roles see nothing
        }

        this.totalTheatres = this.theatres.length;

        // OPTIONAL: Auto-select the first theatre if only one exists
        if (this.theatres.length === 1) {
          this.onTheatreChange(this.theatres[0].id);
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Error loading theatres", err);
        this.cdr.detectChanges();
      }
    });
  }

  onTheatreChange(id: any) {
    const theatreId = Number(id);
    this.selectedTheatreId = theatreId;

    if (!theatreId || isNaN(theatreId)) {
      this.resetMetrics();
      return;
    }

    // Trigger the metrics fetch for the selected theatre
    this.fetchMetricsForTheatre(theatreId);
  }

  onTimeFilterChange() {
    this.generateSimulatedMetrics();
  }
  private getHeaders() {
    const token = localStorage.getItem('jwtToken');
    return { headers: new HttpHeaders().set('Authorization', 'Bearer ' + token) };
  }

  resetMetrics() {
    this.totalScreens = 0;
    this.activeShows = 0;
    this.totalSeatsAvailable = 0;
    this.todayBookings = 0;
    this.todayRevenue = 0;
  }

  fetchMetricsForTheatre(theatreId: number) {
    this.isLoading = true;
    this.resetMetrics();

    // 1. Get Screens for the theatre
    this.screenService.getScreensByTheatre(theatreId).subscribe({
      next: (screens) => {
        this.totalScreens = screens.length;

        // Loop screens to aggregate shows & seats
        let pendingRequests = screens.length * 2; // shows + seats per screen
        if (pendingRequests === 0) {
          this.generateSimulatedMetrics();
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        screens.forEach((screen: any) => {
          // Get Shows per screen
          this.http.get<any[]>(`http://localhost:8082/api/shows/screen/${screen.id}`, this.getHeaders()).subscribe({
            next: (shows) => {
              this.activeShows += shows.length;
              if (--pendingRequests === 0) this.finishLoadingMetrics();
            },
            error: () => { if (--pendingRequests === 0) this.finishLoadingMetrics(); }
          });

          // Get Seats per screen
          this.http.get<any[]>(`http://localhost:8082/api/seats/screen/${screen.id}`, this.getHeaders()).subscribe({
            next: (seats) => {
              this.totalSeatsAvailable += seats.filter(s => s.status === 'ACTIVE').length;
              if (--pendingRequests === 0) this.finishLoadingMetrics();
            },
            error: () => { if (--pendingRequests === 0) this.finishLoadingMetrics(); }
          });
        });

      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  finishLoadingMetrics() {
    this.generateSimulatedMetrics();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  generateSimulatedMetrics() {
    // Generate dynamic wow-factor metrics for revenue and bookings based on active shows
    if (this.activeShows > 0 || this.totalScreens > 0) { // Fallback if no active shows yet but screens exist
      const activeCount = this.activeShows || this.totalScreens * 3;
      let baseBookings = Math.floor(Math.random() * 150) + (activeCount * 20);
      let multiplier = 1;
      
      if (this.timeFilter === 'month') multiplier = 30;
      if (this.timeFilter === 'year') multiplier = 365;

      this.todayBookings = baseBookings * multiplier;
      this.todayRevenue = this.todayBookings * 250; // avg 250 per ticket
    } else {
      this.todayBookings = 0;
      this.todayRevenue = 0;
    }
  }
}
