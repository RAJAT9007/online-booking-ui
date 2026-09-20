import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { ScreenService } from '../../services/screen.service';
import { TheatreService } from '../../services/theatre.service';
import { ShowService } from '../../services/show.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-manage-theatre',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-theatre.html',
  styleUrls: ['./manage-theatre.css']
})
export class ManageTheatre implements OnInit {

  theatres: any[] = [];
  screens: any[] = [];
  selectedTheatreId: number | null = null;
  searchText: string = '';

  screen: any = { id: null, screenName: '', totalSeats: '', status: '' };
  showForm: boolean = false;
  isEditMode: boolean = false;

  // Seat Layout State
  viewingSeatLayoutForScreen: number | null = null;
  seats = signal<any[]>([]);
  rows: string[] = [];
  seatGrid: { [key: string]: any[] } = {};
  isLoadingLayout: boolean = false;

  // Seat Edit State
  showEditPanel: boolean = false;
  selectedSeat: any = null;
  bulkPrices = { PREMIUM: 500, GOLD: 300, SILVER: 200 };

  // Show / Movies State
  viewingMoviesForScreen: number | null = null;
  shows: any[] = [];
  availableMovies: any[] = [];
  showFormDetails: any = {
    movieId: '',
    startTime: '',
    endTime: '',
    language: 'English'
  };

  constructor(
    private theatreService: TheatreService,
    private screenService: ScreenService,
    private showService: ShowService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadTheatres();
  }

  // ── Theatres ──────────────────────────────────────────────────

  loadTheatres() {
    const ownerId = Number(localStorage.getItem('ownerId'));
    const role = localStorage.getItem('role');

    this.theatreService.getTheatres().subscribe({
      next: (res: any) => {
        this.theatres = role === 'OWNER'
          ? res.filter((t: any) => Number(t.ownerId) === ownerId)
          : res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading theatres', err)
    });
  }

  onTheatreChange(id: any) {
    this.viewingSeatLayoutForScreen = null;
    if (this.viewingMoviesForScreen) this.viewingMoviesForScreen = null;

    const theatreId = Number(id);
    this.selectedTheatreId = theatreId;

    if (!theatreId || isNaN(theatreId)) {
      this.screens = [];
      return;
    }

    this.loadScreens();
  }

  // ── Screens ───────────────────────────────────────────────────

  loadScreens() {
    if (!this.selectedTheatreId) return;
    this.screens = [];
    this.screenService.getScreensByTheatre(this.selectedTheatreId).subscribe({
      next: (res) => {
        this.screens = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  filteredScreens() {
    if (!this.searchText) return this.screens;
    return this.screens.filter(s =>
      s.screenName?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  openAddForm() {
    this.resetForm();
    this.isEditMode = false;
    this.showForm = true;

  }

  openEditForm(s: any) {
    this.screen = { ...s };
    this.isEditMode = true;
    this.showForm = true;
  }

  saveScreen() {
    if (!this.selectedTheatreId) {
      alert('Select theatre first');
      return;
    }

    const payload = {
      screenName: this.screen.screenName,
      totalSeats: this.screen.totalSeats,
      status: this.screen.status || 'ACTIVE',
      theatreId: this.selectedTheatreId
    };

    if (this.isEditMode && this.screen.id) {
      this.screenService.updateScreen(this.screen.id, payload).subscribe({
        next: () => { alert('Screen updated successfully ✅'); this.showForm = false; this.loadScreens(); },
        error: (err) => console.error('Error updating', err)
      });
    } else {
      this.screenService.addScreen(payload).subscribe({
        next: () => { alert('Screen added successfully ✅'); this.showForm = false; this.loadScreens(); },
        error: (err) => console.error('Error adding', err)
      });
    }
  }

  deleteScreen(id: number) {
    if (confirm('Are you sure you want to delete this screen?')) {
      this.screenService.deleteScreen(id).subscribe({
        next: () => { alert('Screen deleted!'); this.loadScreens(); },
        error: (err) => console.error(err)
      });
    }
  }

  resetForm() {
    this.screen = { id: null, screenName: '', totalSeats: '', status: '' };
  }

  // ── Seat Layout ───────────────────────────────────────────────

  openManageSeats(screenId: number) {
    this.viewingSeatLayoutForScreen = screenId;
    this.fetchSeats(screenId);
  }

  closeManageSeats() {
    this.viewingSeatLayoutForScreen = null;
    this.seats.set([]);
    this.rows = [];
    this.seatGrid = {};
  }

  private getHeaders() {
    return {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('jwtToken'))
    };
  }

  fetchSeats(screenId: number) {
    this.isLoadingLayout = true;
    this.http.get<any[]>(`${environment.apiUrl}/api/seats/screen/${screenId}`, this.getHeaders()).subscribe({
      next: (data) => {
        if (data.length === 0) {
          this.generateSeats(screenId);
        } else {
          this.seats.set(data);
          this.buildGrid();
          this.isLoadingLayout = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => { console.error('Error fetching seats', err); this.isLoadingLayout = false; }
    });
  }

  generateSeats(screenId: number) {
    this.http.post(`${environment.apiUrl}/api/seats/generate/${screenId}`, {}, { responseType: 'text', ...this.getHeaders() }).subscribe({
      next: () => this.fetchSeats(screenId),
      error: (err) => { console.error('Error generating seats', err); this.isLoadingLayout = false; }
    });
  }

  buildGrid() {
    const rowSet = new Set<string>();
    this.seatGrid = {};
    const sortedSeats = [...this.seats()].sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber));
    sortedSeats.forEach(seat => {
      rowSet.add(seat.rowName);
      if (!this.seatGrid[seat.rowName]) this.seatGrid[seat.rowName] = [];
      this.seatGrid[seat.rowName].push(seat);
    });
    this.rows = Array.from(rowSet).sort();
  }

  getSeatClass(seat: any): string {
    if (seat.status === 'BLOCKED' || seat.status === 'INACTIVE') return 'seat-blocked';
    if (seat.seatType === 'RECLINER') return 'seat-recliner';
    if (seat.seatType === 'GOLD') return 'seat-gold';
    if (seat.seatType === 'SILVER') return 'seat-silver';
    return 'seat-normal';
  }

  openEditPanel(seat: any) {
    this.selectedSeat = { ...seat };
    this.showEditPanel = true;
  }

  closeEditPanel() {
    this.showEditPanel = false;
    this.selectedSeat = null;
  }

  saveSeatChanges() {
    if (!this.selectedSeat) return;
    this.http.put(`${environment.apiUrl}/api/seats/update/${this.selectedSeat.id}`, this.selectedSeat, this.getHeaders()).subscribe({
      next: () => {
        if (this.viewingSeatLayoutForScreen) this.fetchSeats(this.viewingSeatLayoutForScreen);
        this.closeEditPanel();
      },
      error: (err) => { console.error('Fallback Update', err); this.applyLocalUpdate(); }
    });
  }

  applyLocalUpdate() {
    const index = this.seats().findIndex(s => s.id === this.selectedSeat.id);
    if (index !== -1) { this.seats.set(this.selectedSeat); this.buildGrid(); }
    this.closeEditPanel();
  }

  bulkUpdateSeatPrice(type: 'PREMIUM' | 'GOLD' | 'SILVER') {
    const price = this.bulkPrices[type];
    if (this.viewingSeatLayoutForScreen) {
      this.http.put(
        `${environment.apiUrl}/api/seats/screen/${this.viewingSeatLayoutForScreen}/bulk-price`,
        { seatType: type, price },
        this.getHeaders()
      ).subscribe({
        next: () => this.fetchSeats(this.viewingSeatLayoutForScreen!),
        error: () => this.localBulkUpdate(type, price)
      });
    }
  }

  localBulkUpdate(type: string, price: number) {
    this.seats().forEach(s => { if (s.seatType === type) s.price = price; });
    this.buildGrid();
    alert(`Bulk update complete for ${type} to ₹${price}`);
  }

  // ── Shows / Movies ────────────────────────────────────────────

  openManageMovies(screenId: number) {
    this.viewingMoviesForScreen = screenId;
    this.viewingSeatLayoutForScreen = null;
    this.fetchMovies();
    this.fetchShows(screenId);
  }

  closeManageMovies() {
    this.viewingMoviesForScreen = null;
    this.shows = [];
  }

  fetchMovies() {
    this.http.get<any[]>(`${environment.apiUrl}/api/movies/all`, this.getHeaders()).subscribe({
      next: (res) => {
        this.availableMovies = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching movies', err)
    });
  }

  fetchShows(screenId: number) {
    this.http.get<any[]>(`${environment.apiUrl}/api/shows/screen/${screenId}`, this.getHeaders()).subscribe({
      next: (res) => {
        console.log('🎬 Shows fetched:', res);
        this.shows = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching shows', err)
    });
  }

  onMovieOrTimeChange() {
    const movie = this.availableMovies.find(m => m.id == this.showFormDetails.movieId);
    const startTime = this.showFormDetails.startTime;

    if (movie && movie.duration && startTime) {
      const start = new Date(startTime);

      if (isNaN(start.getTime())) return;

      const end = new Date(start.getTime() + movie.duration * 60 * 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      this.showFormDetails.endTime =
        `${end.getFullYear()}-` +
        `${pad(end.getMonth() + 1)}-` +
        `${pad(end.getDate())}T` +
        `${pad(end.getHours())}:` +
        `${pad(end.getMinutes())}`;

      console.log('✅ endTime calculated:', this.showFormDetails.endTime);
    }
  }

  addShow() {
    if (!this.showFormDetails.movieId || !this.showFormDetails.startTime) {
      alert('Please select Movie and Start Time');
      return;
    }

    if (!this.showFormDetails.endTime) {
      alert('End time could not be calculated. Please select movie and start time again.');
      return;
    }

    const ensureSeconds = (dt: string) => dt && dt.length === 16 ? dt + ':00' : dt;

    const payload = {
      movieId: Number(this.showFormDetails.movieId),
      screenId: this.viewingMoviesForScreen,
      startTime: ensureSeconds(this.showFormDetails.startTime),
      endTime: ensureSeconds(this.showFormDetails.endTime),
      language: this.showFormDetails.language,
      price: 0
    };

    console.log('📦 Sending payload:', payload);

    this.showService.createShow(payload).subscribe({
      next: (res) => {
        console.log('✅ Show saved to DB:', res);
        alert('Show assigned successfully!');
        this.fetchShows(this.viewingMoviesForScreen!);
        this.showFormDetails = { movieId: '', startTime: '', endTime: '', language: 'English' };
      },
      error: (err) => {
        console.error('❌ Error saving show', err);
        alert('Failed to save show. Check console for details.');
      }
    });
  }

  // Delete show — show.id is the correct field (not show.showId)
  deleteShow(id: number) {
    if (confirm('Are you sure you want to remove this show?')) {
      this.showService.deleteShow(id).subscribe({
        next: () => {
          alert('Show removed!');
          this.fetchShows(this.viewingMoviesForScreen!);
        },
        error: (err) => console.error('Error deleting show', err)
      });
    }
  }

  getMovieTitle(movieId: number): string {
    const m = this.availableMovies.find(movie => movie.id == movieId);
    return m ? m.title : `Movie ID ${movieId}`;
  }
}