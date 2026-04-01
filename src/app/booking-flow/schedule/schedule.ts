import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TheatreService } from '../../services/theatre.service';
import { ScreenService } from '../../services/screen.service';
import { ShowService } from '../../services/show.service';
import { MoviesService } from '../../services/movies.Service';
import { Theatre } from '../../models/theatre.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.css'],
})
export class Schedule implements OnInit {
  movieId: number | null = null;
  // movieDetails: any = null;
  /* 📅 Date Selection */
  selectedDate: string = '';
  availableDates: string[] = [];

  movietitle: string = '';
  // theatrename: string = '';

  /* 🏙️ City Filter */
  selectedCity: any = null;

  shows: any[] = [];
  screens: any[] = [];
  theatres: Theatre[] = [];
  rawTheatreScreens: any[] = []; // Caches { theatre, screens }

  theatreShowsMapping: any[] = []; // { theatre: Theatre, shows: any[], screens: any[] }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private theatreService: TheatreService,
    private screenService: ScreenService,
    private showService: ShowService,
    private moviesService: MoviesService,
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('movieId');
    const storedCity = localStorage.getItem('selectedCity');
    if (storedCity) {
      this.selectedCity = JSON.parse(storedCity);
    }

    this.generateDates();

    if (idParam) {
      this.movieId = Number(idParam);
      // Fetch details and shows synchronously-structured to avoid race mismatch
      this.loadMovieDetails();
      this.loadShows();
    }
    const q = this.route.snapshot.queryParamMap;
    this.movietitle = q.get('movietitle') || '';

  }

  generateDates() {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      // Ensure strictly local YYYY-MM-DD format regardless of timezone
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];
      dates.push(localDate);
    }
    this.availableDates = dates;
    this.selectedDate = dates[0];
  }

  formatDateUI(dateStr: string) {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      date: date.getDate().toString(),
      month: date.toLocaleDateString('en', { month: 'short' })
    };
  }

  selectDate(d: string) {
    this.selectedDate = d;
    this.updateMapping();
  }

  loadMovieDetails() {
    if (this.movieId) {
      this.moviesService.getById(this.movieId).subscribe((data) => {
        this.movietitle = data.title;
      });
    }
  }

  loadShows() {
    if (this.movieId) {
      this.showService.getShowsByMovie(this.movieId).subscribe({
        next: (shows) => {
          this.shows = shows;
          this.loadTheatresAndScreens();
        },
        error: (err) => console.error('Error fetching shows:', err),
      });
    }
  }

  loadTheatresAndScreens() {
    this.theatreService.getTheatres().subscribe({
      next: (theatres) => {
        if (theatres.length === 0) {
          this.rawTheatreScreens = [];
          this.updateMapping();
          return;
        }

        // Resolving asynchronous loop with forkJoin for ALL theatres
        const screenRequests = theatres.map(theatre =>
          this.screenService.getScreensByTheatre(theatre.id).pipe(
            catchError(error => of([])) // Return empty array if error
          )
        );

        forkJoin(screenRequests).subscribe((screensArray: any[]) => {
          this.rawTheatreScreens = [];
          theatres.forEach((theatre, index) => {
            this.rawTheatreScreens.push({
              theatre: theatre,
              screens: screensArray[index]
            });
          });
          // Update UI safely strictly after all network calls complete
          this.updateMapping();
        });
      },
      error: (err) => console.error('Error fetching theatres:', err),
    });
  }

  updateMapping() {
    this.theatreShowsMapping = [];

    this.rawTheatreScreens.forEach((ts) => {
      const screenIds = ts.screens.map((s: any) => s.id);

      const matchingShows = this.shows.filter((show) => {
        // filter by screen and matching date
        return screenIds.includes(show.screenId) && show.startTime.startsWith(this.selectedDate);
      });

      const inSelectedCity = this.selectedCity ? ts.theatre.cityId === this.selectedCity.id : true;
      const hasShows = matchingShows.length > 0;

      if (inSelectedCity || hasShows) {
        this.theatreShowsMapping.push({
          theatre: ts.theatre,
          shows: matchingShows,
          screens: ts.screens,
        });
      }

      // console.log("Selected Date:", this.selectedDate);
      // console.log("Selected City:", this.selectedCity);
      // console.log("Shows:", this.shows);
      // console.log("Raw Theatre Screens:", this.rawTheatreScreens);
    });

    // Optional: Sort so theatres WITH shows are pushed to the top, and empty ones show below
    this.theatreShowsMapping.sort((a, b) => b.shows.length - a.shows.length);
  }

  getScreenName(mapping: any, screenId: number): string {
    const screen = mapping.screens.find((s: any) => s.id === screenId);
    return screen ? screen.screenName : 'Unknown Screen';
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  goToSeatBooking(theatre: Theatre, show: any) {
    this.router.navigate(['/seat-booking'], {
      queryParams: {
        movietitle: this.movietitle,
        showId: show.id,
        theatreId: theatre.id,
        theatrename: theatre.name,
        screenId: show.screenId,
        showDate: this.selectedDate,
        showTime: show.startTime
      }
    });
  }
}