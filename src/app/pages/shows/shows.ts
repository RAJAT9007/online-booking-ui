import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoviesService } from '../../services/movies.Service';
import { TheatreService } from '../../services/theatre.service';
import { ScreenService } from '../../services/screen.service';
import { ShowService } from '../../services/show.service';

@Component({
  selector: 'app-shows',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shows.html',
  styleUrls: ['./shows.css'],
})
export class ShowsComponent implements OnInit {
  movies: any[] = [];
  theatres: any[] = [];
  screens: any[] = [];

  selectedTheatreId: number | null = null;
  selectedScreenId: number | null = null;
  selectedMovieId: number | null = null;

  showForm: boolean = false;

  newShow = {
    screenId: null,
    movieId: null,
    startTime: '',
    endTime: '',
    language: 'Hindi',
    price: 150,
    availableSeats: 0,
    status: 'ACTIVE',
  };

  constructor(
    private moviesService: MoviesService,
    private theatreService: TheatreService,
    private screenService: ScreenService,
    private showService: ShowService,
  ) {}

  ngOnInit() {
    this.moviesService.showAll().subscribe((data) => (this.movies = data));
    this.theatreService.getTheatres().subscribe((data) => (this.theatres = data));
  }

  onTheatreChange() {
    this.screens = [];
    this.selectedScreenId = null;
    if (this.selectedTheatreId) {
      this.screenService.getScreensByTheatre(this.selectedTheatreId).subscribe((data) => {
        this.screens = data;
      });
    }
  }

  openAddForm() {
    this.showForm = true;
  }

  saveShow() {
    if (!this.selectedScreenId || !this.selectedMovieId) {
      alert('Please select screen and movie!');
      return;
    }
    this.newShow.screenId = this.selectedScreenId as any;
    this.newShow.movieId = this.selectedMovieId as any;

    const screenObj = this.screens.find((s) => s.id == this.selectedScreenId);
    if (screenObj) {
      this.newShow.availableSeats = screenObj.totalSeats;
    }

    this.showService.createShow(this.newShow).subscribe(
      (res) => {
        alert('Show Added Successfully!');
        this.showForm = false;
        // Reset form
        this.newShow.startTime = '';
        this.newShow.endTime = '';
      },
      (err) => {
        console.error(err);
        alert('Error adding show.');
      },
    );
  }
}
