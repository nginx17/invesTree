import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	lat : number;
	long : number;
	woeid : number;
	data : object[] = [];

	constructor(
		private dataService : DataService
	) { }

	ngOnInit() {
		/* Ambil latitude & longitude posisi saat ini */
		this.getCurrentLocation();
	}

	getCurrentLocation(){
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition((position) => {
				this.lat = position.coords.latitude;
				this.long = position.coords.longitude;
				this.getWoeId();
			});
		} else {
			/* Jika browser tidak support, set default latitude & longitude Jakarta */
			this.lat = -6.171440;
			this.long = 106.827820;
		}
	}

	getWoeId(){
		this.dataService.getWoeId(this.lat,this.long)
		.then(result => {
			this.woeid = result[0].woeid;
			this.getDataWeather();
		});
	}

	getDataWeather(){
		this.dataService.getDataWeather(this.woeid)
		.then(result => {
			this.data = result['consolidated_weather'];
		});
	}
}
