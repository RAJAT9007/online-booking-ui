import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../jwt-token-handling/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],

})
export class RegisterComponent {
  // User का डेटा स्टोर करने के लिए ऑब्जेक्ट
  registerData = {
    name: '',
    email: '',
    password: '',
    number: 0,
    role: '' // Default value
  };

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService) { }

  register() {
    if (!this.registerData.email &&
      !this.registerData.password
    ) {
      this.toastr.warning('Please enter email & password');
      return;

    } if (!this.registerData.email) {
      this.toastr.warning('Please enter email');
      return;
    }
    if (!this.registerData.password) {
      this.toastr.warning('Please enter password');
      return;
    }
    if (!this.registerData.number) {
      this.toastr.warning('Please enter Mobile-number');
      return;
    }
    console.log("Sending Data:", this.registerData);

    this.authService.register(this.registerData).subscribe({
      next: (res: any) => {
        console.log(res);
        this.toastr.success("Registration Successful");
        this.router.navigate(['/login']);

      }, error: (error) => {
        this.toastr.warning("Registration Failed");
      }
    });
  }
}