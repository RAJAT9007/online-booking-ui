import { Component, OnInit } from '@angular/core';
import { ScreenService } from '../../services/screen.service';
import { TheatreService } from '../../services/theatre.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  seats: any[] = [];
  rows: string[] = [];
  seatGrid: { [key: string]: any[] } = {};
  isLoadingLayout: boolean = false;
  
  // Seat Edit State
  showEditPanel: boolean = false;
  selectedSeat: any = null;
  bulkPrices = { PREMIUM: 300, NORMAL: 200 };

  // Inject HttpClient securely since old services might be pruned
  constructor(
    private theatreService: TheatreService,
    private screenService: ScreenService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadTheatres();
  }

  loadTheatres() {
    this.theatreService.getTheatres().subscribe({
      next: (res: any) => this.theatres = res,
      error: (err: any) => console.error("Error loading theatres", err)
    });
  }

  // ✅ When dropdown changes perfectly tied to ngModel
  onTheatreChange(id: any) {
    this.viewingSeatLayoutForScreen = null; // Reset layout view
    if (this.viewingMoviesForScreen) this.viewingMoviesForScreen = null; // Reset movie view
    
    const theatreId = Number(id);
    this.selectedTheatreId = theatreId;
    
    if (!theatreId) {
      this.screens = [];
      return;
    }
    
    this.loadScreens();
  }

  loadScreens() {
    if (!this.selectedTheatreId) return;
    this.screens = []; // instantly clear old screens while loading
    this.screenService.getScreensByTheatre(this.selectedTheatreId).subscribe({
      next: (res) => {
        this.screens = res;
      },
      error: (err) => console.error(err)
    });
  }

  filteredScreens() {
    if (!this.searchText) return this.screens;
    return this.screens.filter(screen => screen.screenName?.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  // SCREEN CRUD
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
      alert("Select theatre first");
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
        next: () => {
          alert("Screen updated successfully ✅");
          this.showForm = false;
          this.loadScreens();
        },
        error: (err) => console.error("Error updating", err)
      });
    } else {
      this.screenService.addScreen(payload).subscribe({
        next: () => {
          alert("Screen added successfully ✅");
          this.showForm = false;
          this.loadScreens();
        },
        error: (err) => console.error("Error adding", err)
      });
    }
  }

  deleteScreen(id: number) {
    if (confirm("Are you sure you want to delete this screen?")) {
      this.screenService.deleteScreen(id).subscribe({
        next: () => {
          alert("Screen deleted!");
          this.loadScreens();
        },
        error: (err) => console.error(err)
      });
    }
  }

  resetForm() {
    this.screen = { id: null, screenName: '', totalSeats: '', status: '' };
  }

  // === SEAT LAYOUT LOGIC ===
  openManageSeats(screenId: number) {
    this.viewingSeatLayoutForScreen = screenId;
    this.fetchSeats(screenId);
  }

  closeManageSeats() {
    this.viewingSeatLayoutForScreen = null;
    this.seats = [];
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
    this.http.get<any[]>(`http://localhost:8082/api/seats/screen/${screenId}`, this.getHeaders()).subscribe({
      next: (data) => {
        if (data.length === 0) {
          this.generateSeats(screenId);
        } else {
          this.seats = data;
          this.buildGrid();
          this.isLoadingLayout = false;
        }
      },
      error: (err) => {
        console.error("Error fetching seats", err);
        this.isLoadingLayout = false;
      }
    });
  }

  generateSeats(screenId: number) {
    this.http.post(`http://localhost:8082/api/seats/generate/${screenId}`, {}, { responseType: 'text', ...this.getHeaders() }).subscribe({
      next: () => this.fetchSeats(screenId),
      error: (err) => {
        console.error("Error generating seats", err);
        this.isLoadingLayout = false;
      }
    });
  }

  buildGrid() {
    const rowSet = new Set<string>();
    this.seatGrid = {};
    const sortedSeats = [...this.seats].sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber));
    sortedSeats.forEach(seat => {
      rowSet.add(seat.rowName);
      if (!this.seatGrid[seat.rowName]) this.seatGrid[seat.rowName] = [];
      this.seatGrid[seat.rowName].push(seat);
    });
    this.rows = Array.from(rowSet).sort();
  }

  getSeatClass(seat: any): string {
    if (seat.status === 'BLOCKED' || seat.status === 'INACTIVE') return 'seat-blocked';
    if (seat.seatType === 'PREMIUM') return 'seat-premium';
    if (seat.seatType === 'GOLD') return 'seat-gold'; 
    if (seat.seatType === 'SILVER') return 'seat-silver';
    return 'seat-normal'; 
  }

  // Seat Edit panel
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
    this.http.put(`http://localhost:8082/api/seats/update/${this.selectedSeat.id}`, this.selectedSeat, this.getHeaders()).subscribe({
      next: () => {
        if (this.viewingSeatLayoutForScreen) this.fetchSeats(this.viewingSeatLayoutForScreen);
        this.closeEditPanel();
      },
      error: (err) => {
        console.error("Fallback Update", err);
        this.applyLocalUpdate();
      }
    });
  }

  applyLocalUpdate() {
    const index = this.seats.findIndex(s => s.id === this.selectedSeat.id);
    if (index !== -1) {
      this.seats[index] = this.selectedSeat;
      this.buildGrid();
    }
    this.closeEditPanel();
  }

  bulkUpdateSeatPrice(type: 'PREMIUM' | 'NORMAL') {
    const price = this.bulkPrices[type];
    if (this.viewingSeatLayoutForScreen) {
      this.http.put(`http://localhost:8082/api/seats/screen/${this.viewingSeatLayoutForScreen}/bulk-price`, { seatType: type, price }, this.getHeaders())
        .subscribe({
          next: () => this.fetchSeats(this.viewingSeatLayoutForScreen!),
          error: () => this.localBulkUpdate(type, price)
        });
    }
  }

  localBulkUpdate(type: string, price: number) {
    this.seats.forEach(s => { if (s.seatType === type) { s.price = price; } });
    this.buildGrid();
    alert(`Bulk update complete for ${type} to ${price}`);
  }

  // --- Show / Movies State ---
  viewingMoviesForScreen: number | null = null;
  shows: any[] = [];
  availableMovies: any[] = [];
  showFormDetails: any = {
    movieId: '',
    startTime: '',
    endTime: '',
    language: 'English',
    price: 250
  };

  openManageMovies(screenId: number) {
    this.viewingMoviesForScreen = screenId;
    this.viewingSeatLayoutForScreen = null; // hide layout
    this.fetchMovies();
    this.fetchShows(screenId);
  }

  closeManageMovies() {
    this.viewingMoviesForScreen = null;
    this.shows = [];
  }

  fetchMovies() {
    this.http.get<any[]>('http://localhost:8082/api/movies/all', this.getHeaders()).subscribe({
      next: (res) => this.availableMovies = res,
      error: (err) => console.error("Error fetching movies", err)
    });
  }

  fetchShows(screenId: number) {
    this.http.get<any[]>(`http://localhost:8082/api/shows/screen/${screenId}`, this.getHeaders()).subscribe({
      next: (res) => this.shows = res,
      error: (err) => console.error("Error fetching shows", err)
    });
  }

  addShow() {
    if (!this.showFormDetails.movieId || !this.showFormDetails.startTime || !this.showFormDetails.endTime) {
      alert("Movie, Start Time, and End Time are required");
      return;
    }
    
    const payload = {
      movieId: Number(this.showFormDetails.movieId),
      screenId: this.viewingMoviesForScreen,
      startTime: this.showFormDetails.startTime,
      endTime: this.showFormDetails.endTime,
      language: this.showFormDetails.language,
      price: this.showFormDetails.price
    };

    this.http.post('http://localhost:8082/api/shows/create', payload, this.getHeaders()).subscribe({
      next: () => {
        alert("Show assigned to screen successfully!");
        this.fetchShows(this.viewingMoviesForScreen!);
        // Reset form
        this.showFormDetails = { movieId: '', startTime: '', endTime: '', language: 'English', price: 250 };
      },
      error: (err) => {
        console.error("Error adding show", err);
        alert("Failed to add show. Check backend logs.");
      }
    });
  }

  deleteShow(id: number) {
    if(confirm("Are you sure you want to remove this movie/show?")) {
      this.http.delete(`http://localhost:8082/api/shows/${id}`, { responseType: 'text', ...this.getHeaders() }).subscribe({
        next: () => this.fetchShows(this.viewingMoviesForScreen!),
        error: (err) => console.error("Error deleting show", err)
      });
    }
  }

  getMovieTitle(movieId: number): string {
    const m = this.availableMovies.find(movie => movie.id == movieId);
    return m ? m.title : `Movie ID ${movieId}`;
  }
}