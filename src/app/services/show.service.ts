import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ShowService {

    private apiUrl = 'http://localhost:8082/api/shows';

    constructor(private http: HttpClient) { }

    // ✅ Helper — adds token to every request
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('jwtToken');
        return new HttpHeaders()
            .set('Authorization', 'Bearer ' + token);
    }

    // ✅ Get all shows for a movie
    getShowsByMovie(movieId: number): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.apiUrl}/movie/${movieId}`,
            { headers: this.getHeaders() }
        );
    }

    // ✅ Get show by ID
    getShowById(showId: number): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/${showId}`,
            { headers: this.getHeaders() }
        );
    }

    // ✅ Create show (admin only)
    createShow(show: any): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/create`,
            show,
            { headers: this.getHeaders() }
        );
    }

    // ✅ Delete show (admin only)
    deleteShow(showId: number): Observable<void> {
        return this.http.delete<void>(
            `${this.apiUrl}/delete/${showId}`,
            { headers: this.getHeaders() }
        );
    }
}