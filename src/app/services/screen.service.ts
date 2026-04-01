import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ScreenService {

    private apiUrl = 'http://localhost:8082/api/screens';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('jwtToken');
        return new HttpHeaders().set('Authorization', 'Bearer ' + token);
    }

    getScreensByTheatre(theatreId: number): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.apiUrl}/theatre/${theatreId}`,
            { headers: this.getHeaders() }
        );
    }

    addScreen(screenData: any): Observable<any> {
        return this.http.post<any>(this.apiUrl + "/add", screenData, { headers: this.getHeaders() });
    }

    getScreens(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + "/all", { headers: this.getHeaders() });
    }

    deleteScreen(screenId: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/delete/${screenId}`, { headers: this.getHeaders() });
    }

    updateScreen(screenId: number, screenData: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/update/${screenId}`, screenData, { headers: this.getHeaders() });
    }
}
