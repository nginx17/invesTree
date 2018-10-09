import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import * as moment from 'moment';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	imageAPI = 'https://metaweather.com/static/img/weather/';
	lat : number;
	long : number;
	woeid : number;
	currentLocation : string;
	data : object[] = null;
	dataToday : object = null;

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
			this.woeid = result[0]['woeid'];
			this.currentLocation = result[0]['title'];
			this.getDataWeather();
		});
	}

	getDataWeather(){
		this.dataService.getDataWeather(this.woeid)
		.then(result => {
			var data = result['consolidated_weather'];
			this.dataToday = data[0];
			this.data = [];
			for(var i=1; i<=5; ++i){
				if(data[i] == undefined) break;
				this.data.push({
					dayName : moment(data[i]['applicable_date']).format('dddd'),
					minTemp : this.optimizeNumber(data[i]['min_temp']),
					maxTemp : this.optimizeNumber(data[i]['max_temp']),
					icon : this.imageAPI+data[i]['weather_state_abbr']+'.svg'
				});
			}
		});
	}

	optimizeNumber(num:number){
		return Math.floor(num);
	}
}
