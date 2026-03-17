import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class CityService {
    private apiUrl = "http://localhost:8082/api/city";

    constructor(private http: HttpClient) { }

    addCity() {
        const token = localStorage.getItem("jwtToken");
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    }
}