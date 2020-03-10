import React from 'react';
import {View, StyleSheet, ImageBackground, StatusBar, ScrollView, Animated} from 'react-native';
import {connect} from 'react-redux';

import Text from '../main/components/CustomText';
import Header from './menu/Header';
import FooterMenu from './menu/FooterMenu';
import BasicWeatherPanel from './weather/BasicWeatherPanel';
import DayPickerList from './components/DayPickerList';
import MapView from "react-native-maps";

class MainPage extends React.Component {

    state = {
        scroll: false,
        fontLoaded: false,
        locationOpacity: new Animated.Value(1),
    };

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
        if (this.props.currentTimestamp !== 0){
            let forecast = this.props.forecast;

            for (let daily of forecast) {
                if (daily.timestamp === this.props.currentTimestamp) {
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
                        <DayPickerList/>
                        <BasicWeatherPanel forecastData={this.getCurrentForecast()}/>

                        {/*todo to change*/}
                        <View style={{marginTop: 10, width: '90%', height: 300, backgroundColor: 'white', borderRadius: 20}}>
                            <Text>{this.props.forecastViewType}</Text>
                        </View>
                        <View style={{marginTop: 10, width: '90%', height: 300, backgroundColor: 'white', borderRadius: 20, overflow: 'hidden'}}>
                            <MapView
                                style={{
                                    borderRadius: 8,
                                    height: '100%',
                                    width: '100%',
                                    shadowOffset: {width: 16.4, height: 1.6}
                                }}
                                initialRegion={{
                                    latitude: 37.78825,
                                    longitude: -122.4324,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                            />
                        </View>

                    </ScrollView>
                    <FooterMenu/>
                </ImageBackground>
            </View>
        )
    }
}

function mapStateToProps(state){
    return {
        forecastViewType: state.forecastViewType,
        days: state.days,
        forecast: state.rootForecastPerDay,
        currentTimestamp: state.currentTimestamp
    }
}

export default connect(mapStateToProps)(MainPage);

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
