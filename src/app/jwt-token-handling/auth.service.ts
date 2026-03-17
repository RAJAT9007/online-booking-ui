import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    getUserRole() {
        throw new Error('Method not implemented.');
    }

    private baseUrl = 'http://localhost:8082/api/auth'; // your backend URL

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