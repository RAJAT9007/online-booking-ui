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
    updateCity(id: number, body: { name: string; pincode: string }) {
        return this.http.put(
            this.apiUrl + "/update/" + id,
            body,  // ✅ correct body
            { headers: this.getHeaders() }
        );
    }
}