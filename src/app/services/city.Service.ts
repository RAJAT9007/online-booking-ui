import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class CityService {

    private apiUrl = "http://localhost:8082/api/city";

    constructor(private http: HttpClient) { }

    private getHeaders() {
        const token = localStorage.getItem("jwtToken");
        return new HttpHeaders().set('Authorization', 'Bearer ' + token);
    }

    // ✅ ADD CITY
    addCity(body: { name: string; pincode: string }) {
        return this.http.post(
            this.apiUrl + "/add",
            body,  // ✅ correct body
            { headers: this.getHeaders() }
        );
    }

    // ✅ GET ALL
    getAllCities() {
        return this.http.get(
            this.apiUrl + "/all",
            { headers: this.getHeaders() }
        );
    }

    // ✅ DELETE
    deleteCity(id: number) {
        return this.http.delete(
            this.apiUrl + "/delete/" + id,
            { headers: this.getHeaders() }
        );
    }

    // ✅ UPDATE
    updateCity(id: number, body: any) {
        // The backend explicitly demands `@RequestBody String cityName` for this route,
        // so we must send only the string value directly as plain text.
        return this.http.put(
            this.apiUrl + "/update/" + id,
            body.cityName,
            { headers: this.getHeaders().set('Content-Type', 'text/plain') }
        );
    }
}