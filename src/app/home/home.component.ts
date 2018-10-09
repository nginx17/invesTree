import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import * as moment from 'moment';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { CookieService } from 'ngx-cookie-service';

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

	search : any = null;
	searchResult : object = [];
	searchFlag : boolean = false;
	searchHistory : object[] = [];

	loading : boolean = false;
	faSave = faSave;

	constructor(
		private dataService : DataService,
		private cookie : CookieService
	) { }

	ngOnInit() {
		/* Ambil latitude & longitude posisi saat ini */
		this.getCurrentLocation();

		/* Ambil data search yang telah disimpan sebelumnya dari cookie "saveSearch" */
		if(this.cookie.check('saveSearch')){

			/* Input cookie data save search ke var searchHistory */
			this.searchHistory = JSON.parse(this.cookie.get('saveSearch'));
		}
	}

	/* Ambil posisi latitude & longitude */
	getCurrentLocation(){
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition((position) => {
				this.lat = position.coords.latitude;
				this.long = position.coords.longitude;

				/* Cari woeId berdasarkan koordinat */
				this.getWoeId();
			});
		} else {
			/* Jika browser tidak support, set default latitude & longitude Jakarta */
			this.lat = -6.171440;
			this.long = 106.827820;
		}
	}

	getWoeId(){
		/** Lookup data woeid ke API menggunakan latitude & longitude */
		this.dataService.getWoeId(this.lat,this.long)
		.then(result => {
			this.woeid = result[0]['woeid'];
			this.currentLocation = result[0]['title'];

			/* Ambil data weather dari API setelah mendapatkan woeid */
			this.getDataWeather();
		});
	}

	/**
	 * @param woeid : number {optional}
	 *
	 * Jika param null ambil dari data woeid default yang didapatkan dari fungsi getWoeId
	 */

	getDataWeather(woeid:number=null){
		if(woeid==null) woeid = this.woeid;

		/* Set default value */
		this.data = null;
		this.dataToday = null;

		this.dataService.getDataWeather(woeid)
		.then(result => {
			var data = result['consolidated_weather'];
			this.dataToday = data[0];
			this.data = [];

			/* Push data yang didapat ke variable data */
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

	/** Search block
	 * 	@param args form controls
	 */
	getSearch(args){
		var searchQuery = args.controls['search'].value;
		if(searchQuery != '') {
			/* Clean data */
			this.loading = true;
			this.searchFlag = false;
			this.searchResult = [];

			this.dataService.getDataCitySearch(searchQuery)
			.then(result => {
				/* Masukkan data yang didapat kedalam variable */
				this.searchResult = result;
				this.loading = false;
				this.searchFlag = true;
			}).catch(() => { this.loading = false; });
		}
	}

	getWeatherFromSearch(woeid=null){
		this.getDataWeather(woeid);
	}

	/** Save Search
	 *	@param item object
	 */
	saveSearch(item:object){
		var oldData : any = this.cookie.get('saveSearch') || null;
		if(oldData == null){
			oldData = [];
		} else {
			oldData = JSON.parse(oldData);
		}

		/* cek woeId sudah disampan sebelumnya */
		if(oldData.find(x => x['woeid'] == item['woeid']) == undefined){
			oldData.push(item);
		}

		this.searchHistory = oldData;
		this.cookie.set('saveSearch',JSON.stringify(oldData));
	}
}
