import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
    constructor(private http: HttpClient) { }

    getTheaters(date: string, time: string) {
        return this.http.get<any[]>(`http://localhost:8080/api/theaters?date=${date}&time=${time}`);
    }
}
