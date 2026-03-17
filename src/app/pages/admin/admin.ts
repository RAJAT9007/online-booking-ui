import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink, RouterOutlet } from "@angular/router";
import { MoviesService } from '../../services/movies.Service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterLink,
    RouterOutlet,
    FormsModule
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})

export class Admin implements OnInit {

  activeSection: string = 'dashboard';
  movies: any[] = [];
  newMovie = { title: '', genre: '', status: 'ACTIVE' };

  constructor(private moviesService: MoviesService) { }

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.moviesService.showAll().subscribe(data => this.movies = data);
  }

  // onAddMovie() {
  //   this.moviesService.addMovies(this.newMovie).subscribe(() => {
  //     alert('Movie Added Successfully!');
  //     this.loadMovies();
  //     this.activeSection = 'manage-movies';
  //   });
  // }

  deleteMovie(id: number) {
    if (confirm('Are you sure you want to delete this movie?')) {
      this.moviesService.deleteMovie(id).subscribe(() => this.loadMovies());
    }
  }

}
// export class Admin {

//   selectedSection: string = 'users';

//   users: any[] = [];
//   movies: any[] = [];
//   theaters: any[] = [];

//   constructor(private http: HttpClient) {
//     this.loadUsers();
//   }

//   select(section: string) {
//     this.selectedSection = section;

//     if (section === 'users') this.loadUsers();
//     if (section === 'movies') this.loadMovies();
//     // if (section === 'theaters') this.loadTheaters();
//   }

//   // USERS
//   loadUsers() {
//     this.http.get<any[]>('http://localhost:8082/api/admin/users')
//       .subscribe(data => this.users = data);
//   }

//   deleteUser(id: number) {
//     this.http.delete(`http://localhost:8082/api/admin/users/${id}`)
//       .subscribe(() => this.loadUsers());
//   }

//   // MOVIES
//   loadMovies() {
//     this.http.get<any[]>('http://localhost:8082/api/admin/movies')
//       .subscribe(data => this.movies = data);
//   }

//   deleteMovie(id: number) {
//     this.http.delete(`http://localhost:8082/api/admin/movies/${id}`)
//       .subscribe(() => this.loadMovies());
//   }

//   // THEATERS
//   // loadTheaters() {
//   //   this.http.get<any[]>('http://localhost:8082/api/admin/theaters')
//   //     .subscribe(data => this.theaters = data);
//   // }

//   // deleteTheater(id: number) {
//   //   this.http.delete(`http://localhost:8082/api/admin/theaters/${id}`)
//   //     .subscribe(() => this.loadTheaters());
//   // }

// }