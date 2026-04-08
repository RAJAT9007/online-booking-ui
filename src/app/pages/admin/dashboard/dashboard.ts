import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TheatreService } from '../../../services/theatre.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  
  theaters: any[] = [];
  selectedTheaterId: string = 'all';
  timeFilter: string = 'day';
  
  // Dummy data arrays for the metrics to simulate the filters
  totalTicketsBooked = 2450;
  totalSeatsAvailable = 8400;
  totalRevenue = 545000;
  activeTheaters = 0;

  constructor(private theatreService: TheatreService) {}

  ngOnInit() {
    this.theatreService.getTheatres().subscribe((res: any[]) => {
      this.theaters = res;
      this.activeTheaters = res.length;
    });
  }

  onFilterChange() {
    // Generate dynamic mock metrics based on selection to give the illusion of filtering
    let baseBookings = 2450;
    let baseSeats = 8400;

    if (this.selectedTheaterId !== 'all') {
      // Create deterministic random-looking numbers for individual theaters
      const idStr = this.selectedTheaterId.toString();
      const base = Number(idStr.replace(/[^0-9]/g, '')) || 1;
      baseBookings = Math.floor(100 + (base * 3.4) % 400);
      baseSeats = Math.floor(200 + (base * 5.1) % 500);
    }

    let multiplier = 1;
    if (this.timeFilter === 'month') multiplier = 30;
    if (this.timeFilter === 'year') multiplier = 365;

    this.totalTicketsBooked = baseBookings * multiplier;
    this.totalSeatsAvailable = baseSeats;
  }

}
