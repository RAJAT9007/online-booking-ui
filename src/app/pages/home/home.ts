import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MoviesService } from '../../services/movies.Service';
import { Movie } from '../../models/movie.model';
import { OnlyMovies } from "../only-movies/only-movies";

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  /* 🗺️ Manual Poster Map (Matches Spring Boot Title to public/posters folder) */
  /* 🔎 Search & Filter */
  searchTerm: string = '';
  selectedGenre: string = '';
  genres: string[] = ['Action', 'Comedy', 'Drama', 'Sci-Fi'];

  /* 🎬 Movie Lists */
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  nowShowing: Movie[] = [];
  upcoming: Movie[] = [];

  /* ⭐ Slider Control */
  currentIndex: number = 0;

  constructor(private router: Router, private moviesService: MoviesService) { }

  ngOnInit(): void {
    this.loadMovies();
    this.autoSlide();
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

        console.log('Movies loaded with posters:', this.movies);
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
  nextSlide() {
    // if (this.currentIndex < this.poster.length - 1) {
    //   this.currentIndex++;
    // } else {
    //   this.currentIndex = 0;
    // }
  }

  /* 🔥 Previous Slide */
  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      // this.currentIndex = this.poster.length - 1;
    }
  }

  /* 🔥 Auto Sliding */
  autoSlide() {
    setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  /* 🚪 Login Logout */
  logout() {
    localStorage.removeItem('jwtToken'); // ✅ match your token key
    this.router.navigate(['/login']);
  }

  /* 🎟️ Book Movie */
  bookMovie(id: number) {
    this.router.navigate(['/movie-details', id]);
  }

  // Inside your HomeComponent class
  updateMoviePoster(movieId: number, newImageName: string) {
    const movie = this.movies.find(m => m.id === movieId);

    if (movie) {
      movie.poster_Url = newImageName;
      this.applyFilters();

      console.log(`Poster for ${movie.title} updated to ${newImageName}`);
    }
  }


}

