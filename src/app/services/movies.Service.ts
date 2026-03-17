import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Movie } from '../models/movie.model';
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class MoviesService {

    private apiUrl = "http://localhost:8082/api/movies";

    constructor(private http: HttpClient) { }

    // ✅ Helper method — no need to repeat token code everywhere!
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('jwtToken');
        return new HttpHeaders().set('Authorization', 'Bearer ' + token);
    }

    // ✅ Show all movies
    showAll(): Observable<Movie[]> {
        return this.http.get<Movie[]>(
            `${this.apiUrl}/all`,
            { headers: this.getHeaders() }
        );
    }

    // ✅ Get movie by ID
    getById(id: number): Observable<Movie> {
        return this.http.get<Movie>(
            `${this.apiUrl}/${id}`,  // ← try without /find/
            { headers: this.getHeaders() }
        );
    }
    // ✅ Add movie
    addMovies(movie: Movie): Observable<Movie> {
        return this.http.post<Movie>(
            `${this.apiUrl}/add`,
            movie,
            { headers: this.getHeaders() }
        );
    }

    // ✅ Update movie
    updateMovie(id: number, movie: Movie): Observable<Movie> {
        return this.http.put<Movie>(
            `${this.apiUrl}/update/${id}`,
            movie,
            { headers: this.getHeaders() }
        );
    }

    // ✅ Delete movie
    deleteMovie(id: number): Observable<void> {
        return this.http.delete<void>(
            `${this.apiUrl}/delete/${id}`,
            { headers: this.getHeaders() }
        );
    }
}

// environment variables - frontend and backend
// coding standards
// debuging - frontend
// fix frontend interceptor

// enable emvironment variable as below:
// 1. take all neccessary enviromentn variables and do the ChangeDetectionStrategy
// 2. follow coding standartds 