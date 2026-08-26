import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HealthService implements OnDestroy {
  private apiUrl = 'http://localhost:8082/api/health';
  private timerId: any = null;

  constructor(private http: HttpClient) {
    this.startHealthPing();
  }

  startHealthPing() {
  
    this.pingBackend();

    // Ping every 10 minutes (600,000 ms)
    this.timerId = setInterval(() => {
      this.pingBackend();
    }, 600000);
  }

  pingBackend() {
    this.http.get(this.apiUrl).subscribe({
      next: (res) => console.log(' Backend Health Status:', res),
      error: (err) => console.warn(' Backend Ping Failed:', err)
    });
  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}
