import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { HomeComponent } from './pages/home/home';
import { Admin } from './pages/admin/admin';
import { MoviesComponent } from './pages/movies/movies';
import { TheatersComponent } from './pages/theaters/theaters';
import { ShowsComponent } from './pages/shows/shows';
import { MoviesDetails } from './booking-flow/movies-details/movies-details';
import { Schedule } from './booking-flow/schedule/schedule';
import { SeatBooking } from './booking-flow/seat-booking/seat-booking';
import { AuthGuard } from './jwt-token-handling/auth.guard';
import { OnlyMovies } from './pages/only-movies/only-movies';
import { LandingComponent } from './pages/landing/landing';
import { PaymentComponent } from './pages/payment/payment';
import { BookingConfirmationComponent } from './pages/booking-confirmation/booking-confirmation';
import { City } from './pages/city/city';
import { ManageTheatre } from './theatre/manage-theatre/manage-theatre';
import { OwnerPage } from './theatre/owner-page/owner-page';
import { OwnerTheatreComponent } from './theatre/owner-theatres/owner-theatres';
import { Dashboard } from './theatre/dashboard/dashboard';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'home', component: HomeComponent },
    { path: 'movie-details/:id', component: MoviesDetails },// Movies Details 
    { path: 'schedule/:movieId', component: Schedule }, // शेड्यूल के लिए पाथ
    { path: 'seat-booking', component: SeatBooking },
    { path: 'only-movies', component: OnlyMovies },
    { path: 'payment', component: PaymentComponent },
    { path: 'booking-confirmation/:id', component: BookingConfirmationComponent },
    { path: 'city', component: City },
    { path: 'theatre-owner', component: ManageTheatre },
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
            { path: 'dashboard', component: OwnerPage }, // simple for now
            { path: 'screens', component: ManageTheatre }
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
            { path: 'city', component: City }
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