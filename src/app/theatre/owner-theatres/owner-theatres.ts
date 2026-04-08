import { Component, ChangeDetectorRef, signal } from '@angular/core';
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
    id: 0
  };

  theaters = signal<Theatre[]>([]);
  currentPage = signal<number>(1);
  pageSize = signal<number>(5);
  isEdit = false;
  showForm = false;

  constructor(
    private theatreService: TheatreService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const ownerId = localStorage.getItem("ownerId");
    if (ownerId) {
      this.theatre.ownerId = Number(ownerId);
      this.loadTheatres(this.theatre.ownerId);
    }
  }

  loadTheatres(ownerId: number) {
    this.theatreService.getTheatres().subscribe(data => {
      this.theaters.set(data.filter(t => t.ownerId === ownerId));
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
      this.theatreService.updateTheatre(this.theatre.id, this.theatre).subscribe(updatedTheatre => {
         const index = this.theaters().findIndex(t => t.id === updatedTheatre.id);
         if (index !== -1) {
            const current = this.theaters();
            current[index] = updatedTheatre;
            this.theaters.set([...current]);
         }
         this.showForm = false;
         this.resetForm();
      });
    } else {
      this.theatreService.addTheatre(this.theatre).subscribe({
        next: (res: Theatre) => {
          this.theaters.set([...this.theaters(), res]);
          this.showForm = false;
          this.resetForm();
        },
        error: (err) => {
          console.error("Error creating theatre", err);
          alert("Something went wrong ❌");
        }
      });
    }
  }

  editTheatre(t: Theatre) {
    this.theatre = { ...t };
    this.isEdit = true;
    this.showForm = true;
  }

  deleteTheatre(id: number) {
    if (!id) return;
    const confirmDelete = confirm("Are you sure you want to delete this theatre?");
    if (confirmDelete) {
        this.theatreService.deleteTheatre(id).subscribe(() => {
          this.theaters.set(this.theaters().filter(t => t.id !== id));
        });
    }
  }

  resetForm() {
    const ownerId = localStorage.getItem("ownerId");
    this.theatre = {
      name: '',
      address: '',
      cityId: 0,
      ownerId: ownerId ? Number(ownerId) : 0,
      status: 'ACTIVE',
      id: 0
    };
  }
}