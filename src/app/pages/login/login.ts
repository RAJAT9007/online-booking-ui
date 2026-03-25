import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../jwt-token-handling/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  loginData = {
    email: '',
    password: ''
  };
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,

  ) { }

  onLogin() {

    if (!this.loginData.email && !this.loginData.password) {
      this.toastr.warning('Please enter email & password');
      return;
    }
    // console.log("Sending Data:", this.loginData);

    this.authService.login(this.loginData).subscribe({
      next: (res: any) => {
        if (res.token) {
          localStorage.setItem("jwtToken", res.token);
          if (res.id) localStorage.setItem("ownerId", res.id.toString());
          if (res.email) localStorage.setItem("email", res.email);
          if (res.role) localStorage.setItem("role", res.role);
          
          const role = this.authService.getUserRole();
          
          if (role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else if (role === 'OWNER') {
            this.router.navigate(['/owner']);
          } else {
            this.router.navigate(['/home']);
          }
        }
      }, error: (error) => {
        this.toastr.error("Invalid email or password");
      }
    });
  }
}