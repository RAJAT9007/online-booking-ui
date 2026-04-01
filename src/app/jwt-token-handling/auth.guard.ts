import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = () => {
    const router = inject(Router);
    const token = localStorage.getItem('jwtToken'); // ✅ Matches SeatService key
    if (token) {
        return true;
    } else {
        router.navigate(['/login']);
        return false;
    }
};