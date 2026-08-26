import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MoviesService } from '../../services/movies.Service';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-only',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './only-movies.html',
  styleUrls: ['./only-movies.css']
})
export class OnlyMovies implements OnInit, OnDestroy {

  posterMap: { [key: string]: string } = {
    'Avengers: Endgame': 'avengers.jpg',
    'Pushpa 2': 'iron-man.png',
    'Kalki 2898 AD': 'kalki.jpg',
    'Thor': 'thor.png',
    'leo': 'leo.jpg',
    'leo-2': 'leo.jpg',
    'Jawan': 'braking-bad.jpg',
    'Raone': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0i0fgUadv49CZkV9iC8c5a1COYf-QtTvygA&s',
    'Dhurandhar': 'https://i.pinimg.com/736x/b9/e6/f9/b9e6f97209a0f550b634e85970fa5000.jpg'
  };

  searchTerm: string = '';
  selectedGenre: string = '';
  genres: string[] = ['Action', 'Comedy', 'Drama', 'Sci-Fi'];


  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  nowShowing: Movie[] = [];
  upcoming: Movie[] = [];


  currentIndex: number = 0;
  slideInterval: any;

  constructor(private router: Router, private moviesService: MoviesService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadMovies();
    this.autoSlide();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }
  getPosterPath(movie: any): string {
    if (movie.poster_Url.startsWith('http')) {
      return movie.poster_Url;
    }

    return `assets/posters/${movie.poster_Url}`;
  }
  /* Load Movies from Spring Boot */
  loadMovies(): void {
    this.moviesService.showAll().subscribe({
      next: (data) => {

        this.movies = data.map(movie => ({
          ...movie,

          poster_Url: this.posterMap[movie.title] ? this.posterMap[movie.title] : movie.poster_Url || 'placeholder.jpg'
        }));

        this.applyFilters();


        this.nowShowing = this.movies.filter(m => m.status === 'ACTIVE');
        this.upcoming = this.movies.filter(m => m.status === 'PENDING');

        this.cdr.detectChanges();
        console.log('Movies loaded with posters:', this.movies);
      },
      error: (err) => {
        console.error('Failed to load movies from Spring Boot:', err);
      }
    });
  }


  applyFilters() {

    if (!this.searchTerm && !this.selectedGenre) {
      this.filteredMovies = [...this.movies];
      return;
    }
  }


  nextSlide() {
    // this.currentIndex = (this.currentIndex + 1) % this.poster.length;
  }

  prevSlide() {
    // this.currentIndex = (this.currentIndex - 1 + this.poster.length) % this.poster.length;
  }

  autoSlide() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  logout() {
    localStorage.removeItem('jwtToken');
    this.router.navigate(['/login']);
  }

  bookMovie(id: number) {
    this.router.navigate(['/booking', id]);
  }

  updateMoviePoster(movieId: number, newImageName: string) {
    const movie = this.movies.find(m => m.id === movieId);
    if (movie) {

      movie.poster_Url = newImageName.startsWith('posters/') ? newImageName : `posters/${newImageName}`;
      this.applyFilters();
    }
  }
}