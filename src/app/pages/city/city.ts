import { Component, OnInit } from '@angular/core';
import { CityService } from '../../services/city.Service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-city',
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
  cities: any[] = [];

  // Edit Mode
  editingId: number | null = null;

  constructor(private cityService: CityService) { }

  ngOnInit(): void {
    this.getCities();
  }

  // ✅ GET ALL CITIES
  getCities() {
    this.cityService.getAllCities().subscribe({
      next: (res: any) => {
        this.cities = res;
        console.log("Cities:", this.cities);
      },
      error: (err) => {
        console.error("Error fetching cities", err);
      }
    });
  }

  // ✅ ADD CITY
  addCity() {

    if (!this.city.cityName || !this.city.pincode) {
      alert("Please fill all fields");
      return;
    }

    if (this.city.pincode.length !== 6) {
      alert("Pincode must be 6 digits");
      return;
    }

    this.cityService.addCity(this.city).subscribe({
      next: () => {
        alert("City added successfully ✅");
        this.getCities();
        this.resetForm();
      },
      error: (err) => {
        console.error("Error adding city", err);
      }
    });
  }

  // ✅ EDIT CITY
  editCity(c: any) {
    this.city = { ...c };
    this.editingId = c.id;
  }

  // ✅ UPDATE CITY
  updateCity() {

    if (!this.editingId) return;

    this.cityService.updateCity(this.editingId, this.city).subscribe({
      next: () => {
        alert("City updated successfully ✏️");
        this.getCities();
        this.resetForm();
      },
      error: (err) => {
        console.error("Error updating city", err);
      }
    });
  }

  // ✅ DELETE CITY
  deleteCity(id: number) {

    if (!confirm("Are you sure you want to delete?")) return;

    this.cityService.deleteCity(id).subscribe({
      next: () => {
        alert("City deleted ❌");
        this.getCities();
      },
      error: (err) => {
        console.error("Error deleting city", err);
      }
    });
  }

  // ✅ RESET FORM
  resetForm() {
    this.city = {
      cityName: '',
      pincode: ''
    };
    this.editingId = null;
  }
}