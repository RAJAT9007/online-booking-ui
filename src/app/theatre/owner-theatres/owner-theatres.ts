import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TheatreService } from '../../services/theatre.service';
import { Router } from '@angular/router';
import { Theatre } from '../../models/theatre.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-owner-theatre',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './owner-theatres.html',
  styleUrls: ['./owner-theatres.css']
})
export class OwnerTheatreComponent {

  theatre: Theatre = {
    name: '',
    address: '',
    cityId: 0,
    ownerId: 0,
    status: 'ACTIVE',
    id: 0,
    theatreId: ""
  };

  constructor(
    private theatreService: TheatreService,
    private router: Router
  ) { }

  ngOnInit() {
    const ownerId = localStorage.getItem("ownerId");
    if (ownerId) {
      this.theatre.ownerId = Number(ownerId);
    }
  }

  createTheatre() {

    this.theatreService.addTheatre(this.theatre)
      .subscribe((res: any) => {

        localStorage.setItem("theatreId", res.theatreId); // ⭐ store
        this.router.navigate(['/owner/screens']);         // ⭐ next step
      });

  }

  openTheatres() {
    this.router.navigate(['/owner/theatre']);
  }
}