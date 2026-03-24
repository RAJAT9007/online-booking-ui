import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Theatre } from '../models/theatre.model';

@Injectable({
    providedIn: 'root'
})
export class TheatreService {
    getTheatresByOwner() {
        throw new Error('Method not implemented.');
    }

    private apiUrl = "http://localhost:8082/api/theatre";

    constructor(private http: HttpClient) { }

    getTheatres(): Observable<Theatre[]> {
        const token = localStorage.getItem("jwtToken");
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
        return this.http.get<Theatre[]>(this.apiUrl + "/all", { headers });
    }

    addTheatre(theatre: Theatre): Observable<Theatre> {
        const token = localStorage.getItem("jwtToken");
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
        return this.http.post<Theatre>(this.apiUrl + "/add", theatre, { headers });
    }

    updateTheatre(id: number, theatre: Theatre): Observable<Theatre> {
        const token = localStorage.getItem("jwtToken");
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
        return this.http.put<Theatre>(`${this.apiUrl}/${id}`, theatre, { headers });
    }

    deleteTheatre(id: number): Observable<void> {
        const token = localStorage.getItem("jwtToken");
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
        return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers });
    }

}
