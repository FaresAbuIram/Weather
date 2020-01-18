import { Component, OnInit } from '@angular/core';
import { WeatherService } from 'src/app/services/weather-service.service';
import { foreCastForFourDays } from '../foreCastForFourDays'
import { MatDialog, MatDialogConfig } from '@angular/material';
import { CitiesComponent } from 'src/app/pages/cities/cities.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    lat: number;
    lon: number;
    weather: any;
    foreCast: any;
    currentWeather = {
        name: '',
        icon: 'wait',
        temp: '',
        description: '',
        
    }
    foreCastArray = [];

    constructor(private weatherService: WeatherService, private matDialog: MatDialog, private router: Router) { }

    ngOnInit() {
        navigator.geolocation.getCurrentPosition((success) => {
            this.lat = success.coords.latitude;
            this.lon = success.coords.longitude;
            this.weatherService.getWeatherDateByCoords('weather', this.lat, this.lon).subscribe((data) => {
                this.weather = data;
                this.setData(this.weather);
                this.weatherService.getWeatherDateByCoords("forecast", this.lat, this.lon).subscribe((data) => {
                    this.foreCast = data;
                    this.foreCastArray = this.setDataForeCast(this.foreCast.list);
                })
            })
        })
    }

    getDay(date: string) {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let dates = new Date(date);
        let day = dates.getDay();
        return days[day];

    }

    setData(data: any) {
        try {
            this.currentWeather.name = data.name;
            this.currentWeather.icon = data.weather[0].icon;
            this.currentWeather.temp = data.main.temp;
            this.currentWeather.description = data.weather[0].description;
        }
        catch (e) {
            console.log(e);
        }
    }

    setDataForeCast(data: any) {
        let counter = 4;
        let four = [];
        let currentDay = this.getDay(data[0].dt_txt);
        let i = 1;
        try {
            while (counter > 0 && i < data.length) {
                if (currentDay != this.getDay(data[i].dt_txt)) {
                    let fourDays = new foreCastForFourDays(this.getDay(data[i].dt_txt),
                        data[i].weather[0].icon,
                        data[i].main.temp_max,
                        data[i].main.temp_min,
                        data[i]);
                    four.push(fourDays);
                    currentDay = this.getDay(data[i].dt_txt);
                    counter--;
                }
                i++;
            }
        }
        catch (e) {
            console.log(e);
        }
        return four;
    }
    onCreate() {
        const matDialogConfig = new MatDialogConfig();
        matDialogConfig.disableClose = true;
        matDialogConfig.autoFocus = true;
        matDialogConfig.width = '80%';
        matDialogConfig.height = '640px';
        matDialogConfig.data = this.currentWeather.name;
        matDialogConfig.panelClass = 'custom-modalbox';
        matDialogConfig.data = this.currentWeather.name;

        let g = this.matDialog.open(CitiesComponent, matDialogConfig);
        g.afterClosed().subscribe(result => {
            let city = result;
            this.weatherService.getDataByCityName('weather', city).subscribe((data) => {
                this.weather = data;
                this.setData(this.weather);
                this.weatherService.getDataByCityName("forecast", city).subscribe((data) => {
                    this.foreCast = data;
                    this.foreCastArray = this.setDataForeCast(this.foreCast.list);

                });
            })
        })
    }
    goTo(data:any) {
        this.weatherService.setDetails(data);
        this.router.navigate(["home/details",this.currentWeather.name]);
    }
}