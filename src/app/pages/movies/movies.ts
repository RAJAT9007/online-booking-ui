import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MoviesService } from '../../services/movies.Service';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './movies.html',
  styleUrls: ['./movies.css']
})
export class MoviesComponent {

  showForm = false;
  isEdit = false;
  searchTerm: string = '';   // ✅ added
  genres: string[] = ['Action', 'Comedy', 'Drama', 'Sci-Fi'];
  selectedGenre: string = '';
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];

  movie: Movie = {
    id: 0,
    title: '',
    description: '',
    duration_minutes: 0,
    language: '',
    genre: '',
    poster_Url: '',
    status: '',
    image: '',
    rating: 0
  };



  constructor(private moviesService: MoviesService) { }

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.moviesService.showAll().subscribe(data => {
      this.movies = data;
      this.filteredMovies = data; // ✅ inside subscribe
    });
  }

  filterMovies() {
    const term = this.searchTerm.toLowerCase();
    this.filteredMovies = this.movies.filter(m =>
      (m.title.toLowerCase().includes(term) || m.genre.toLowerCase().includes(term)) &&
      (this.selectedGenre === '' || m.genre === this.selectedGenre)
    );
  }

  openAddForm() {
    this.showForm = true;
    this.isEdit = false;
    this.resetForm();
  }

  editMovie(m: Movie) {
    this.movie = { ...m };
    this.isEdit = true;
    this.showForm = true;
  }

  saveMovie() {
    if (this.isEdit) {
      this.moviesService.updateMovie(this.movie.id, this.movie).subscribe(() => {
        this.loadMovies();   // ✅ re-fetch full list from DB
        this.showForm = false;
        this.resetForm();
      });
    } else {
      this.moviesService.addMovies(this.movie).subscribe(() => {
        this.loadMovies();   // ✅ re-fetch full list from DB
        this.showForm = false;
        this.resetForm();
      });
    }
  }


  deleteMovie(id: number) {
    if (!id) {
      console.log("Movie ID not found");
      return;
    }
    this.moviesService.deleteMovie(id).subscribe(() => {
      this.movies = this.movies.filter(m => m.id !== id);
      this.filteredMovies = [...this.movies]; // ✅ keep filtered list in sync
    });
  }

  resetForm() {
    this.movie = {
      id: 0,
      title: '',
      description: '',
      duration_minutes: 0,
      language: '',
      genre: '',
      poster_Url: '',
      status: '',
      image: '',
      rating: 0
    };
    this.isEdit = false;
  }
}
