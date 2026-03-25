import { Component, OnInit } from '@angular/core';
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
  cities: any[] = [];
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
    private cityService: CityService
  ) { }

  ngOnInit(): void {
    this.loadCities();
    this.loadMovies();
    this.autoSlide();
  }

  loadCities(): void {
    this.cityService.getAllCities().subscribe({
      next: (data: any) => {
        this.cities = data;
        const storedCity = localStorage.getItem('selectedCity');
        if (storedCity) {
          this.selectedCity = JSON.parse(storedCity);
        } else if (this.cities.length > 0) {
          this.selectedCity = this.cities[0];
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
        this.movies = data.map(movie => ({
          ...movie
        }));
        this.applyFilters();
        this.nowShowing = this.movies.filter(m => m.status === 'ACTIVE');
        this.upcoming = this.movies.filter(m => m.status === 'PENDING');
      },
      error: (err) => {
        console.error('Failed to load movies from Spring Boot:', err);
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    this.filteredMovies = this.movies.filter(m =>
      (m.title.toLowerCase().includes(term) || m.genre.toLowerCase().includes(term)) &&
      (this.selectedGenre === '' || m.genre === this.selectedGenre)
    );
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
}

