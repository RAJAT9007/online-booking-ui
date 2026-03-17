import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MoviesService } from '../../services/movies.Service';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
    this.generateDates();
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

  generateDates() {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    this.availableDates = dates;
    this.selectedDate = dates[0];
  }

  formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      date: date.getDate().toString(),
      month: date.toLocaleDateString('en', { month: 'short' })
    };
  }

  bookTickets() {
    console.log('movie.id:', this.movie.id);
    this.router.navigate(['/schedule', this.movie.id]);
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