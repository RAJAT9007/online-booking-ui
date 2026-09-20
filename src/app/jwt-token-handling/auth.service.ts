import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    getUserRole(): string | null {
        const token = this.getToken();
        if (token) {
            try {
                const payload = token.split('.')[1];
                const decodedJson = atob(payload);
                const decodedData = JSON.parse(decodedJson);
                return decodedData.role || null;
            } catch (error) {
                console.error('Error decoding token:', error);
                return null;
            }
        }
        return null;
    }

    private baseUrl = `${environment.apiUrl}/api/auth`;

    constructor(private http: HttpClient) { }

    login(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/login`, data);
    }

    register(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/register`, data);
    }

    saveToken(token: string) {
        localStorage.setItem('jwtToken', token);
    }

    getToken(): string | null {
        return localStorage.getItem('jwtToken');
    }

    logout() {
        localStorage.removeItem('jwtToken');
    }
}