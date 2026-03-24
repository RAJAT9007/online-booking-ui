import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeatLayoutService {

  private readonly API_URL = 'http://localhost:8082/api/seats';

  constructor(private http: HttpClient) { }

  // 1. Get seats by screen (already exists in backend /api/seats/screen/{screenId})
  getSeats(screenId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/screen/${screenId}`);
  }

  // 2. Add / Initial generation of seats (already mapped to /api/seats/generate/{screenId})
  // Usually this is triggered right after creating the screen if it's empty
  generateSeats(screenId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/generate/${screenId}`, {}, { responseType: 'text' });
  }

  // 3. Update single seat
  updateSeat(seatId: number, payload: any): Observable<any> {
    return this.http.put(`${this.API_URL}/update/${seatId}`, payload);
  }

  // 4. Bulk update price
  bulkUpdatePrice(screenId: number, type: string, price: number): Observable<any> {
    return this.http.put(`${this.API_URL}/screen/${screenId}/bulk-price`, { seatType: type, price });
  }
}
