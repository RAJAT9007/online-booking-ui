import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface ScreenData {
  id?: number;
  screenName: string;
  totalSeats: number;
  theatreId: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class OwnerScreensService {

  private readonly API_URL = 'http://localhost:8082/api/screens';
  
  // State for context
  private theatreIdSubject = new BehaviorSubject<number | null>(null);
  public theatreId$ = this.theatreIdSubject.asObservable();

  private screenIdSubject = new BehaviorSubject<number | null>(null);
  public screenId$ = this.screenIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  setTheatreId(id: number | null) {
    this.theatreIdSubject.next(id);
    if (id) {
      localStorage.setItem('ownerTheatreId', id.toString());
    } else {
      localStorage.removeItem('ownerTheatreId');
    }
  }

  getTheatreId(): number | null {
    let id = this.theatreIdSubject.getValue();
    if (!id) {
      const stored = localStorage.getItem('ownerTheatreId');
      if (stored) {
        id = parseInt(stored, 10);
        this.theatreIdSubject.next(id);
      }
    }
    return id;
  }

  setScreenId(id: number | null) {
    this.screenIdSubject.next(id);
  }

  getScreensByTheatre(theatreId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/theatre/${theatreId}`);
  }

  createScreen(payload: ScreenData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/add`, payload);
  }

}
