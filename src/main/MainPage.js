import React from 'react';
import {View, StyleSheet, ImageBackground, StatusBar, ScrollView, Animated} from 'react-native';
import Text from '../main/components/CustomText';
import Header from './menu/Header';
import FooterMenu from './menu/FooterMenu';
import BasicWeatherPanel from './weather/BasicWeatherPanel';
import DayPickerList from './components/DayPickerList';
import TOKEN from "./token";

export default class MainPage extends React.Component {

    state = {
        scroll: false,
        fontLoaded: false,
        days: [],
        locationOpacity: new Animated.Value(1),
        forecast: [],
        currentTimestamp: 0
    };

    constructor(props){
        super(props);
        this.loadDataWeather();
    }

    async loadDataWeather() {
        try {
            let response = await fetch('https://api.darksky.net/forecast/' + TOKEN + '/50.1102653,19.7615527?units=si');
            let responseJson = await response.json();

            let forecastPerDay = this.parseToForecastPerDay(responseJson);
            this.setState({
                forecast: forecastPerDay,
                currentTimestamp: forecastPerDay[0].timestamp
            });

            let dayForecastArray = responseJson.daily.data;
            let days = this.getDateObjectsList(dayForecastArray);
            this.setState({days: days})
        } catch (error) {
            console.log(error);
        }
    };

    parseToForecastPerDay(forecast){
        let dailyForecastArray = forecast.daily.data;

        let forecastArray = [];
        for(let dayForecast of dailyForecastArray){
            let dailyForecast = {
                temperature: this.parseNumber((dayForecast.temperatureMin + dayForecast.temperatureMax)/2),
                temperatureMin: this.parseNumber(dayForecast.temperatureMin),
                temperatureMax: this.parseNumber(dayForecast.temperatureMax),
                icon: dayForecast.icon,
                summary: dayForecast.summary,
                timestamp: dayForecast.time
            };
            forecastArray.push(dailyForecast);
        }
        forecastArray[0].temperature = forecast.currently.temperature;
        return forecastArray;
    }

    parseNumber(number){
        return (Math.round(number * 100)/100).toFixed(1);
    }

    getDateObjectsList(dayForecastArray){
        let days = [];
        for (let dayForecast of dayForecastArray){
            let dateObject = this.convertUnixTime(dayForecast.time);
            days.push(dateObject);
        }
        return days;
    }

    convertUnixTime(unixTimestamp){
        let date = new Date(unixTimestamp * 1000);
        let days = ['Sun', 'Mon','Tue','Wed','Thu','Fri','Sat'];
        return {
            timestamp: unixTimestamp,
            date: date.getDate(),
            day: days[date.getDay()]
        }
    }

    onScrollNotTopMinimizeHeader = (event) => {
        const y = event.nativeEvent.contentOffset.y;
        if(y >= 10 && this.state.scroll===false){
            Animated.timing(this.state.locationOpacity, {
                toValue: 0,
                duration: 400
            }).start();
            this.setState({scroll: true});
        }
        if(y < 10 && this.state.scroll===true){
            Animated.timing(this.state.locationOpacity, {
                toValue: 1,
                duration: 400
            }).start();
            this.setState({scroll: false});
        }
    };

    getCurrentForecast = () => {
        if (this.state.currentTimestamp !== 0){
            let forecast = this.state.forecast;

            for (let daily of forecast) {
                if (daily.timestamp === this.state.currentTimestamp) {
                    return daily;
                }
            }
        }
        return {
            temperature: 1,
            temperatureMin: 0,
            temperatureMax: 0,
            icon: 'clear',
            summary: 'error',
            timestamp: 0
        }
    };

    setCurrentTimestamp = (timestamp) => {
        this.setState({currentTimestamp: timestamp});
    };

    render = () => {
        let locationStyle = {
            opacity: this.state.locationOpacity
        };

        return(
            <View style={{flex: 1}}>
                <View style={styles.statusBarCover}/>
                <ImageBackground
                    style={styles.imageBackground}
                    source={require('../../assets/images/background.jpg')}
                >
                    <Header isScrool={this.state.scroll}/>
                    <ScrollView
                        contentContainerStyle={{alignItems: 'center'}}
                        onScroll={this.onScrollNotTopMinimizeHeader}
                        nestedScrollEnabled={true}
                    >
                        <Animated.View style={[styles.locationView, locationStyle]}>
                            <View style={{flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                                <Text style={{fontSize: 25}}>Widokowa 22</Text>
                                <Text style={{fontSize: 50}}>Zabierzów</Text>
                            </View>
                        </Animated.View>
                        <DayPickerList
                            days={this.state.days}
                            currentTimestamp={this.state.currentTimestamp}
                            setCurrentTimestamp={this.setCurrentTimestamp}
                        />
                        <BasicWeatherPanel forecastData={this.getCurrentForecast()}/>

                        {/*todo to change*/}
                        <View style={{marginTop: 10, width: '90%', height: 300, backgroundColor: 'white', borderRadius: 20}}>
                        </View>
                        <View style={{marginTop: 10, width: '90%', height: 300, backgroundColor: 'white', borderRadius: 20}}>
                        </View>

                    </ScrollView>
                    <FooterMenu/>
                </ImageBackground>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    statusBarCover: {width: '100%',
        height: StatusBar.currentHeight,
        backgroundColor: '#FFAD94'
    },
    imageBackground: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#0000'
    },
    locationView : {flex: 1,
        flexDirection: 'row',
        paddingHorizontal: '5%',
        marginVertical: 8
    },
});
