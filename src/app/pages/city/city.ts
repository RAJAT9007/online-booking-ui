import { Component, OnInit, signal } from '@angular/core';
import { CityService } from '../../services/city.Service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './city.html',
  styleUrls: ['./city.css']
})
export class City implements OnInit {

  // Form Model
  city: any = {
    cityName: '',
    pincode: ''
  };

  // Data List
  cities = signal<any[]>([]);
  
  currentPage = signal<number>(1);
  pageSize = signal<number>(5);

  // Status
  showForm = false;
  editingId: number | null = null;
  get isEdit() { return this.editingId !== null; }

  constructor(private cityService: CityService) { }

  ngOnInit(): void {
    this.getCities();
  }

  openAddForm() {
    this.showForm = true;
    this.resetForm();
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  getCities() {
    this.cityService.getAllCities().subscribe({
      next: (res: any) => {
        this.cities.set(res);
        this.currentPage.set(1);
      },
      error: (err) => {
        console.error("Error fetching cities", err);
      }
    });
  }

  get paginatedCities() {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.cities().slice(startIndex, startIndex + this.pageSize());
  }

  get totalPages() {
    return Math.ceil(this.cities().length / this.pageSize());
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

  saveCity() {
    if (!this.city.cityName || !this.city.pincode) {
      alert("Please fill all fields");
      return;
    }

    if (String(this.city.pincode).length !== 6) {
      alert("Pincode must be exactly 6 digits");
      return;
    }

    if (this.isEdit && this.editingId) {
      this.cityService.updateCity(this.editingId, this.city).subscribe({
        next: () => {
          this.getCities();
          this.closeForm();
        },
        error: (err) => {
          console.error("Error updating city", err);
        }
      });
    } else {
      this.cityService.addCity(this.city).subscribe({
        next: () => {
          this.getCities();
          this.closeForm();
        },
        error: (err) => {
          console.error("Error adding city", err);
        }
      });
    }
  }

  editCity(c: any) {
    this.city = { ...c };
    this.editingId = c.id;
    this.showForm = true;
  }

  deleteCity(id: number) {
    const isConfirmed = confirm("Are you sure you want to delete this city? 🗑️");
    if (isConfirmed) {
      this.cityService.deleteCity(id).subscribe({
        next: () => {
          this.getCities();
        },
        error: (err) => {
          console.error("Error deleting city", err);
        }
      });
    }
  }

  resetForm() {
    this.city = {
      cityName: '',
      pincode: ''
    };
    this.editingId = null;
  }
}