import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Theatre } from '../models/theatre.model';

@Injectable({
    providedIn: 'root'
})
export class TheatreService {

    private apiUrl = "http://localhost:8082/api/theatre";

    constructor(private http: HttpClient) { }

    private getAuthHeaders() {
        const token = localStorage.getItem("jwtToken");
        return {
            headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
        };
    }

    getTheatres(): Observable<Theatre[]> {
        return this.http.get<Theatre[]>(`${this.apiUrl}/all`, this.getAuthHeaders());
    }

    addTheatre(theatre: Theatre): Observable<Theatre> {
        return this.http.post<Theatre>(`${this.apiUrl}/add`, theatre, this.getAuthHeaders());
    }

    updateTheatre(id: number, theatre: Theatre): Observable<Theatre> {
        return this.http.put<Theatre>(`${this.apiUrl}/${id}`, theatre, this.getAuthHeaders());
    }

    deleteTheatre(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, this.getAuthHeaders());
    }
}