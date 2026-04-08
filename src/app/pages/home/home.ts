import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MoviesService } from '../../services/movies.Service';
import { CityService } from '../../services/city.Service';
import { Movie } from '../../models/movie.model';
import { OnlyMovies } from "../only-movies/only-movies";

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  /* 🔎 Search & Filter */
  searchTerm: string = '';
  selectedGenre: string = '';
  genres: string[] = ['Action', 'Comedy', 'Drama', 'Sci-Fi'];

  /* 🏙️ City Selection */
  cities = signal<any[]>([]);
  selectedCity: any = null;

  /* 🎬 Movie Lists */
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  nowShowing: Movie[] = [];
  upcoming: Movie[] = [];

  /* ⭐ Slider Control */
  currentIndex: number = 0;

  constructor(
    private router: Router,
    private moviesService: MoviesService,
    private cityService: CityService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCities();
    this.loadMovies();
    this.autoSlide();
  }

  loadCities(): void {
    this.cityService.getAllCities().subscribe({
      next: (data: any) => {
        this.cities.set(data);
        const storedCity = localStorage.getItem('selectedCity');
        if (storedCity) {
          this.selectedCity = JSON.parse(storedCity);
        } else if (this.cities().length > 0) {
          this.selectedCity = this.cities()[0];
          localStorage.setItem('selectedCity', JSON.stringify(this.selectedCity));
        }
      },
      error: (err) => console.error('Failed to load cities:', err)
    });
  }

  selectCity(city: any, event: Event): void {
    event.preventDefault();
    this.selectedCity = city;
    localStorage.setItem('selectedCity', JSON.stringify(this.selectedCity));
    // Optional: reload movies if movies depend on city in the backend
  }

  getPosterPath(movie: any): string {
    if (movie.poster_Url.startsWith('http')) {
      return movie.poster_Url;
    }
    return `assets/posters/${movie.poster_Url}`;
  }

  loadMovies(): void {
    this.moviesService.showAll().subscribe({
      next: (data) => {
        this.movies = data.map(movie => ({ ...movie }));

        // TEST: Niche wali line add karein
        this.filteredMovies = [...this.movies];

        // TEST: applyFilters ko thodi der ke liye comment (band) kar dein
        // this.applyFilters(); 

        this.nowShowing = this.movies.filter(m => m.status === 'ACTIVE');
        this.upcoming = this.movies.filter(m => m.status === 'PENDING');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load movies:', err);
      }
    });
  }

  applyFilters() {
    // 1. FAST RETURN: If no search term and no genre is selected, show ALL movies immediately
    if (!this.searchTerm && !this.selectedGenre) {
      this.filteredMovies = [...this.movies];
      return;
    }

    // 2. SAFE FILTERING: Handle missing search terms or null values safely
    const term = (this.searchTerm || '').toLowerCase();

    this.filteredMovies = this.movies.filter(m => {
      // Safely check title and genre (prevents crashes if they are null in the database)
      const safeTitle = m.title ? m.title.toLowerCase() : '';
      const safeGenre = m.genre ? m.genre.toLowerCase() : '';

      // Check if it matches the search bar
      const matchesSearch = term === '' || 
                            safeTitle.startsWith(term) || 
                            safeTitle.includes(' ' + term);

      // Check if it matches the dropdown
      const matchesGenre = this.selectedGenre === '' || m.genre === this.selectedGenre;

      return matchesSearch && matchesGenre;
    });
  }

  /* 🔥 Next Slide */
  nextSlide() { }

  /* 🔥 Previous Slide */
  prevSlide() { }

  /* 🔥 Auto Sliding */
  autoSlide() {
    setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  /* 🚪 Login Logout */
  logout() {
    localStorage.removeItem('jwtToken');
    this.router.navigate(['/login']);
  }

  /* 🎟️ Book Movie */
  bookMovie(id: number) {
    this.router.navigate(['/movie-details', id]);
  }

  showAllMovies() {
    this.router.navigate(['/only-movies']);
  }

  seachByTitle() {
    this.moviesService.searchByTitle(this.searchTerm).subscribe({
      next: (data) => {
        this.filteredMovies = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load movies:', err);
      }
    });
  }
}

