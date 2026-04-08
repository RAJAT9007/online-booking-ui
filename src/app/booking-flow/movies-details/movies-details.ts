import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MoviesService } from '../../services/movies.Service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './movies-details.html',
  styleUrls: ['./movies-details.css']
})
export class MoviesDetails implements OnInit {

  movie: any = null;
  isLoading = true;
  selectedDate: string = '';
  availableDates: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private moviesService: MoviesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    // this.generateDates();
    this.loadMovie(Number(id));
  }

  loadMovie(id: number) {
    this.isLoading = true;
    this.moviesService.getById(id).subscribe({
      next: (data) => {
        this.movie = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  bookTickets() {
    console.log('movie.id:', this.movie.id);
    this.router.navigate(['/schedule', this.movie.id],
      {
        queryParams: {
          movietitle: this.movie.title
        }
      }
    );

  }

  getPosterPath(movie: any): string {
    if (!movie?.poster_Url) return '/placeholder.jpg';
    return movie.poster_Url.startsWith('http')
      ? movie.poster_Url
      : `/${movie.poster_Url}`;
  }

  getStars(rating: number): string[] {
    const stars = [];
    const full = Math.floor(rating / 2);
    for (let i = 0; i < 5; i++) {
      stars.push(i < full ? 'full' : 'empty');
    }
    return stars;
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}