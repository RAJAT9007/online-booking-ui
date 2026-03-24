import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-owner-page',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './owner-page.html',
  styleUrl: './owner-page.css',
})
export class OwnerPage {
  constructor(private router: Router) { }

  // openTheatres() {
  //   this.router.navigate(['/owner/theatre']);
  // }
}
