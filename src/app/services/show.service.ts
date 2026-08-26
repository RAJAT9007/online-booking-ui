import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ShowService {

    private apiUrl = 'http://localhost:8082/api/shows';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('jwtToken');
        return new HttpHeaders()
            .set('Authorization', 'Bearer ' + token);
    }

    getShowsByMovie(movieId: number): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.apiUrl}/movie/${movieId}`,
            { headers: this.getHeaders() }
        );
    }

    getShowById(showId: number): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/${showId}`,
            { headers: this.getHeaders() }
        );
    }

    createShow(show: any): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/create`,
            show,
            { headers: this.getHeaders() }
        );
    }

    deleteShow(showId: number): Observable<void> {
        return this.http.delete<void>(
            `${this.apiUrl}/delete/${showId}`,
            { headers: this.getHeaders() }
        );
    }
}