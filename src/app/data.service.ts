import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class DataService {

	/** By pass CORS issue */
	CORSBYPASS = 'https://cors-anywhere.herokuapp.com/';

	/** API HOST */
	API_HOST = this.CORSBYPASS+'https://www.metaweather.com/';

	constructor(
		private http : HttpClient
	) {}

	getWoeId(latitude:number, longitude:number){
		return new Promise((resolve, error) => {
			this.http.get(this.API_HOST+'api/location/search/?lattlong='+latitude+','+longitude)
			.subscribe(result => {
				resolve(result);
			}, (errorResponse : HttpErrorResponse) => {
				error(errorResponse);
			})
		})
	}
}
