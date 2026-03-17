import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TheatreService } from '../../services/theatre.service';
import { ScreenService } from '../../services/screen.service';
import { ShowService } from '../../services/show.service';
import { MoviesService } from '../../services/movies.Service';
import { Theatre } from '../../models/theatre.model';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.css'],
})
export class Schedule implements OnInit {
  movieId: number | null = null;
  movieDetails: any = null;

  selectedDate: string | null = null;
  shows: any[] = [];
  theatres: Theatre[] = [];
  theatreShowsMapping: any[] = []; // Array of objects: { theatre: Theatre, shows: any[] }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private theatreService: TheatreService,
    private screenService: ScreenService,
    private showService: ShowService,
    private moviesService: MoviesService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('movieId');
    if (idParam) {
      this.movieId = Number(idParam);
      this.loadMovieDetails();
      this.loadShows();
    }
  }

  loadMovieDetails() {
    if (this.movieId) {
      this.moviesService.getById(this.movieId).subscribe((data) => {
        this.movieDetails = data;
      });
    }
  }

  loadShows() {
    if (this.movieId) {
      this.showService.getShowsByMovie(this.movieId).subscribe({
        next: (shows) => {
          this.shows = shows;
          this.loadTheatresAndMapShows();
        },
        error: (err) => console.error('Error fetching shows:', err),
      });
    }
  }

  loadTheatresAndMapShows() {
    this.theatreService.getTheatres().subscribe({
      next: (theatres) => {
        this.theatres = theatres;
        this.theatreShowsMapping = [];

        // For each theatre, fetch its screens
        this.theatres.forEach((theatre) => {
          this.screenService.getScreensByTheatre(theatre.id).subscribe({
            next: (screens) => {
              // Now find which shows match these screens
              const screenIds = screens.map((s) => s.id);
              const matchingShows = this.shows.filter((show) => screenIds.includes(show.screenId));

              if (matchingShows.length > 0) {
                this.theatreShowsMapping.push({
                  theatre: theatre,
                  shows: matchingShows,
                  screens: screens, // Optional: to display screen names
                });
              }
            },
          });
        });
      },
      error: (err) => console.error('Error fetching theatres:', err),
    });
  }

  getScreenName(showsMapping: any, screenId: number): string {
    const screen = showsMapping.screens.find((s: any) => s.id === screenId);
    return screen ? screen.screenName : 'Unknown Screen';
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  goToSeatBooking(theatre: Theatre, show: any) {
    // We could pass showId or theatreId via Route params, but let's just navigate for now
    this.router.navigate(['/seat-booking']);
  }
}
