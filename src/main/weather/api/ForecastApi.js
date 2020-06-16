import {TOKEN} from "../../token";


export default fetchRootForecast;

async function fetchRootForecast(lat, lng){
    try {
        let response = await fetch('http://api.openweathermap.org/data/2.5/onecall?lat='+ lat + '&lon='+lng+'&appid=' + TOKEN + '&units=metric');
        let responseJson = await response.json();
        return {
            current: responseJson.current,
            daily: responseJson.daily,
            hourly: responseJson.hourly,
        }
    } catch (error) {
        console.log(error);
    }
}

