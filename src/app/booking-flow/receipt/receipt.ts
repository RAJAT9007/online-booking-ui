import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [DatePipe],
  templateUrl: './receipt.html',
  styleUrls: ['./receipt.css']
})
export class Receipt implements OnInit {

  bookingId: string | null = null;
  bookingData: any = null;
  isLoading = signal(true);
  today = new Date();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id');
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (this.bookingId) {
      if (sessionId) {
        this.verifySession(sessionId, this.bookingId);
      } else {
        this.fetchBookingDetails(this.bookingId);
      }
    } else {
      this.isLoading.set(false);
      console.error('No Booking ID found in URL');
    }
  }

  verifySession(sessionId: string, bookingId: string) {
    this.isLoading.set(true);
    this.http.post<any>(`http://localhost:8082/api/payments/verify-session?sessionId=${sessionId}&bookingId=${bookingId}`, {}, this.getAuthHeaders())
      .subscribe({
        next: () => {
          this.fetchBookingDetails(bookingId);
        },
        error: (err) => {
          console.error('Payment verification failed', err);
          alert('Payment verification failed. Please contact support.');
          this.isLoading.set(false);
        }
      });
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  fetchBookingDetails(id: string) {
    this.isLoading.set(true);
    this.http.get<any>(`http://localhost:8082/api/bookings/${id}`, this.getAuthHeaders())
      .subscribe({
        next: (data) => {
          this.bookingData = data;
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Could not fetch booking details', err);
          this.isLoading.set(false);
        }
      });
  }

  printReceipt(): void {
    window.print();
  }

  downloadPDF(): void {
    const receiptElement = document.getElementById('receipt-box');

    // Add the specific type check here
    if (receiptElement instanceof HTMLElement) {
      html2canvas(receiptElement, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);

        // Use the safe naming convention
        pdf.save(`Booking_Receipt_${this.bookingData.id || this.bookingId}.pdf`);
      });
    } else {
      console.error("Could not find the 'receipt-box' element to create PDF.");
    }
  }

}