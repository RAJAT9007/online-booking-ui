import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TheatreService } from '../../services/theatre.service';
import { Theatre } from '../../models/theatre.model';

@Component({
  selector: 'app-theaters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theaters.html',
  styleUrls: ['./theaters.css']
})
export class TheatersComponent {
  [x: string]: any;

  theater: Theatre = {
    id: 0,
    name: '',
    address: '',
    cityId: 0,
    registerId: '',
    status: ''
  };

  theaters: Theatre[] = [];
  isEdit = false;
  showForm = false;

  constructor(private theatreService: TheatreService) { }

  ngOnInit() {
    this.loadTheatres();
  }

  loadTheatres() {
    this.theatreService.getTheatres().subscribe(data => this.theaters = data);
  }

  openAddForm() {
    this.showForm = true;
    this.isEdit = false;
    this.resetForm();
  }

  saveTheatre() {
    if (this.isEdit) {
      this.theatreService.updateTheatre(this.theater.id, this.theater).subscribe(updatedTheatre => {
        const index = this.theaters.findIndex(t => t.id === updatedTheatre.id);
        if (index !== -1) this.theaters[index] = updatedTheatre;
        this.showForm = false;
        this.resetForm();
      });
    } else {
      this.theatreService.addTheatre(this.theater).subscribe(newTheatre => {
        this.theaters.push(newTheatre as Theatre);
        this.showForm = false;
        this.resetForm();
      });
    }
  }

  editTheatre(t: Theatre) {
    this.theater = { ...t };
    this.isEdit = true;
    this.showForm = true;
  }

  deleteTheatre(id: number) {
    this.theatreService.deleteTheatre(id).subscribe(() => {
      this.theaters = this.theaters.filter(t => t.id !== id);
    });
  }

  resetForm() {
    this.theater = {
      id: 0,
      name: '',
      address: '',
      cityId: 0,
      registerId: '',
      status: ''
    };
    this.isEdit = false;

  }
}
