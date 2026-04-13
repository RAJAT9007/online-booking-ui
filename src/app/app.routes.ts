import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { HomeComponent } from './pages/home/home';
import { Admin } from './pages/admin/admin';
import { MoviesComponent } from './pages/movies/movies';
import { TheatersComponent } from './pages/theaters/theaters';
import { MoviesDetails } from './booking-flow/movies-details/movies-details';
import { Schedule } from './booking-flow/schedule/schedule';
import { SeatBooking } from './booking-flow/seat-booking/seat-booking';
import { AuthGuard } from './jwt-token-handling/auth.guard';
import { OnlyMovies } from './pages/only-movies/only-movies';
import { LandingComponent } from './pages/landing/landing';
import { Payment } from './booking-flow/payment/payment';
import { Receipt } from './booking-flow/receipt/receipt';
import { City } from './pages/city/city';
import { ManageTheatre } from './theatre/manage-theatre/manage-theatre';
import { OwnerPage } from './theatre/owner-page/owner-page';
import { OwnerTheatreComponent } from './theatre/owner-theatres/owner-theatres';
import { Dashboard } from './theatre/dashboard/dashboard';
import { OwnerProfileComponent } from './theatre/owner-profile/owner-profile';
import { PaymentGateway } from './booking-flow/payment-gate-way/payment-gate-way';
import { Bookings } from './theatre/bookings/bookings';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'home', component: HomeComponent },
    { path: 'movie-details/:id', component: MoviesDetails },
    { path: 'schedule', component: Schedule },
    { path: 'schedule/:movieId', component: Schedule },
    { path: 'seat-booking', component: SeatBooking },
    { path: 'only-movies', component: OnlyMovies },
    { path: 'payment', component: Payment },
    // { path: 'receipt', component: Receipt },
    { path: 'receipt/:id', component: Receipt },
    { path: 'profile', loadComponent: () => import('./pages/user-profile/user-profile').then(m => m.UserProfileComponent) },
    { path: 'city', component: City },
    { path: 'theatre-owner', component: ManageTheatre },
    { path: 'payment-gateway', component: PaymentGateway },
    { path: 'payment-gateway/:bookingId', component: PaymentGateway },
    {
        path: 'owner',
        component: OwnerPage,
        children: [
            {
                path: 'dashboard',
                component: Dashboard
            },
            {
                path: 'theatre',
                component: OwnerTheatreComponent
            },
            {
                path: 'bookings',
                component: Bookings
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: 'dashboard-home',
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'owner',
        component: OwnerPage,
        children: [
            { path: 'dashboard', component: OwnerPage },
            { path: 'screens', component: ManageTheatre },
            { path: 'movie', component: MoviesComponent },
            { path: 'profile', component: OwnerProfileComponent },
            { path: 'bookings', component: Bookings },
            // Example inside your app.routes.ts
            {
                path: 'owner/bookings',
                component: Bookings,
                canActivate: [AuthGuard],
                data: { role: 'OWNER' }
            }
        ]
    },
    {
        path: 'admin',
        component: Admin,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.DashboardComponent) },
            // { path: 'movies', component: MoviesComponent },
            { path: 'theaters', component: TheatersComponent },
            { path: 'city', component: City },
            { path: 'movies', component: MoviesComponent },
            { path: 'login', component: LoginComponent },
            { path: 'bookings', component: Bookings }
        ]
    },
    {
        path: '',
        loadComponent: () =>
            import('./pages/landing/landing')
                .then(m => m.LandingComponent)
    },
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login/login')
                .then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./pages/register/register')
                .then(m => m.RegisterComponent)
    },
    {
        path: 'admin/movies',
        component: MoviesComponent,
        canActivate: [AuthGuard]
    }

];


// import { RouterModule, Routes } from '@angular/router';
// import { LoginComponent } from './pages/login/login';
// import { RegisterComponent } from './pages/register/register';
// import { HomeComponent } from './pages/home/home';
// import { OnlyMovies } from './pages/only-movies/only-movies';
// import { City } from './pages/city/city';
// import { Admin } from './pages/admin/admin';
// import { MoviesComponent } from './pages/movies/movies';
// import { TheatersComponent } from './pages/theaters/theaters';

// // ── Booking Flow ─────────────────────────────────────────────────────────────
// import { MoviesDetails } from './booking-flow/movies-details/movies-details';
// import { Schedule } from './booking-flow/schedule/schedule';
// import { SeatBooking } from './booking-flow/seat-booking/seat-booking';
// import { SeatLayoutComponent } from './booking-flow/seat-layout/seat-layout';
// import { PaymentComponent } from './pages/payment/payment';
// import { BookingConfirmationComponent } from './pages/booking-confirmation/booking-confirmation';

// // ── Owner Section ─────────────────────────────────────────────────────────────
// import { OwnerPage } from './theatre/owner-page/owner-page';
// import { Dashboard } from './theatre/dashboard/dashboard';
// import { OwnerTheatreComponent } from './theatre/owner-theatres/owner-theatres';
// import { ManageTheatre } from './theatre/manage-theatre/manage-theatre';
// import { OwnerProfileComponent } from './theatre/owner-profile/owner-profile';
// import { LandingComponent } from './pages/landing/landing';

// export const routes: Routes = [

//     // ── Public ──────────────────────────────────────────────────────────────
//     { path: '', component: LandingComponent },
//     { path: 'home', component: HomeComponent },
//     { path: 'only-movies', component: OnlyMovies },
//     { path: 'movies', component: MoviesDetails },
//     { path: 'city', component: City },

//     // ── Auth (lazy-loaded for bundle size) ──────────────────────────────────
//     {
//         path: 'login',
//         loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
//     },
//     {
//         path: 'register',
//         loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
//     },

//     // ── Booking Flow (protected) ─────────────────────────────────────────────
//     { path: 'movie-details/:id', component: MoviesDetails, canActivate: [AuthGuard] },
//     { path: 'schedule/:movieId', component: Schedule, canActivate: [AuthGuard] },
//     { path: 'seat-booking', component: SeatBooking, canActivate: [AuthGuard] },
//     { path: 'seat-layout', component: SeatLayoutComponent, canActivate: [AuthGuard] },
//     { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard] },
//     { path: 'booking-confirmation/:id', component: BookingConfirmationComponent, canActivate: [AuthGuard] },

//     // ── Owner Section ────────────────────────────────────────────────────────
//     {
//         path: 'owner',
//         component: OwnerPage,
//         canActivate: [AuthGuard],
//         children: [
//             { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//             { path: 'dashboard', component: Dashboard },
//             { path: 'theatre', component: OwnerTheatreComponent },
//             { path: 'screens', component: ManageTheatre },
//             { path: 'movie', component: MoviesComponent },
//             { path: 'profile', component: OwnerProfileComponent }
//         ]
//     },
//     // Standalone theatre-owner management page
//     { path: 'theatre-owner', component: ManageTheatre, canActivate: [AuthGuard] },

//     // ── Admin Section ─────────────────────────────────────────────────────────
//     {
//         path: 'admin',
//         component: Admin,
//         canActivate: [AuthGuard],
//         children: [
//             { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//             { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.DashboardComponent) },
//             { path: 'theaters', component: TheatersComponent },
//             { path: 'city', component: City },
//             { path: 'movies', component: MoviesComponent }
//         ]
//     },

//     // ── Fallback ──────────────────────────────────────────────────────────────
//     { path: '**', redirectTo: '' }
// ];
