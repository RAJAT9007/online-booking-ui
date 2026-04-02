import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TheatreService } from '../../services/theatre.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-owner-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-profile.html',
  styleUrls: ['./owner-profile.css']
})
export class OwnerProfileComponent implements OnInit {

  ownerEmail: string | null = '';
  ownerPhone: string = '';          // ✅ NEW
  ownerId: number = 0;
  role: string | null = '';
  theatre = signal<any[]>([]);

  constructor(
    private theatreService: TheatreService,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,   // ✅ NEW
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.ownerEmail = localStorage.getItem('email');
    this.ownerId = Number(localStorage.getItem('ownerId'));
    this.role = localStorage.getItem('role');
    this.ownerPhone = localStorage.getItem('phone') || '';  // ✅ NEW

    this.getMyTheatres();
  }

  getMyTheatres() {
    this.theatreService.getTheatres().subscribe((res: any) => {
      this.theatre.set(res.filter((t: any) => t.ownerId === this.ownerId));
      this.cdr.detectChanges();
    });
  }

  // ✅ NEW METHOD
  savePhone() {
    if (!this.ownerPhone || this.ownerPhone.length < 10) {
      this.toastr.warning('Enter a valid 10-digit phone number');
      return;
    }
    localStorage.setItem('phone', this.ownerPhone);
    this.toastr.success('Phone number saved!');
  }

  logout() {
    const phone = localStorage.getItem('phone'); // keep phone after logout
    localStorage.clear();
    if (phone) localStorage.setItem('phone', phone);
    this.router.navigate(['/login']);
  }
}