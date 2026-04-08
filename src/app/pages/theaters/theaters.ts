import { Component, signal } from '@angular/core';
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
    ownerId: 0,
    status: 'ACTIVE',
    // theatreId: ""
  };

  theaters = signal<Theatre[]>([]);
  currentPage = signal<number>(1);
  pageSize = signal<number>(5);
  isEdit = false;
  showForm = false;

  constructor(private theatreService: TheatreService) { }

  ngOnInit() {
    this.loadTheatres();
  }

  loadTheatres() {
    this.theatreService.getTheatres().subscribe(data => {
      this.theaters.set(data);
      this.currentPage.set(1);
    });
  }

  get paginatedTheaters() {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.theaters().slice(startIndex, startIndex + this.pageSize());
  }

  get totalPages() {
    return Math.ceil(this.theaters().length / this.pageSize());
  }

  nextPage() {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  openAddForm() {
    this.showForm = true;
    this.isEdit = false;
    this.resetForm();
  }

  saveTheatre() {
    if (this.isEdit) {
      this.theatreService.updateTheatre(this.theater.id, this.theater).subscribe(updatedTheatre => {
        const index = this.theaters().findIndex(t => t.id === updatedTheatre.id);
        if (index !== -1) this.theaters()[index] = updatedTheatre;
        this.showForm = false;
        this.resetForm();
      });
    } else {
      this.theatreService.addTheatre(this.theater).subscribe(newTheatre => {
        this.theaters.set([...this.theaters(), newTheatre as Theatre]);
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

    if (!id) {
      console.log("Theatre ID not found");
      return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this theatre?");

    if (confirmDelete) {
      this.theatreService.deleteTheatre(id).subscribe(() => {
        this.theaters.set(this.theaters().filter(t => t.id !== id));
        console.log("Theatre deleted successfully");
      });
    }
  }

  resetForm() {
    this.theater = {
      id: 0,
      name: '',
      address: '',
      cityId: 0,
      // theatreId: '',
      status: '',
      ownerId: 0,
    };

  }
}
