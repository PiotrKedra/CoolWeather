import React from 'react';
import {connect, Provider} from 'react-redux';
import { View, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";

import MainPage from './MainPage';
import fetchRootForecast from './weather/api/ForecastApi';
import Geolocation from '@react-native-community/geolocation';
import getLocationDetails from "./location/LocationApi";
import CustomText from "./components/CustomText";
import LottieView from "lottie-react-native";
import GeneralStatusBar from "./components/GeneralStatusBar";
import InitLocationSearchComponent from "./location/InitLocationSearchComponent";

const ACTIVE_LOCATION_STORAGE = '@active_location';

class InitLoader extends React.Component {
  state = {
    isInitialForecastLoaded: false,
    isSearchLocationWindow: false,
    loadingState: 'Getting position...',
    noInternetConnection: false,
  };

  async firstAppLaunchForecastLoading(){
    const isInternetConnection = await NetInfo.fetch().then(state => state.isConnected);
    if(isInternetConnection){
      await this.firstForecastLaunch();
    } else {
        // no internet -> do nothing (need internet for first launch)
        this.setState({loadingState: 'Need internet for first launch.'})
    }
  }

  async firstForecastLaunch() {
    // get current location and load forecast using it
    try {
      const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
            'title': 'Location Access Required',
            'message': 'This App needs to Access your location'
          }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await Geolocation.getCurrentPosition(
            (position) => this.loadForecastWithGivenLocation(position),
            (error) => this.setState({isSearchLocationWindow: true}),
            {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000}
        );
        return;
      }
    } catch (err) {
      console.log(err);
    }
    // if couldn't get location -> load search component
    this.setState({isSearchLocationWindow: true});
  }

  async dataIsNotFresh() {
    try {
      const lastUpdate = await AsyncStorage.getItem('@forecast_update_date').then(date => new Date(JSON.parse(date)));
      return (new Date() - lastUpdate) > 3600000;
    } catch (e) {
      return true;
    }
  }

  async showForecastFromStorage() {
    const activeLocation = await AsyncStorage.getItem('@active_location');
    const lastForecast = await AsyncStorage.getItem('@last_forecast');
    this.props.setInitialForecast(JSON.parse(lastForecast), JSON.parse(activeLocation), false);
    this.setState({isInitialForecastLoaded: true});
  }

  async normalAppLaunch(){
    // load forecast from internet, if no then from storage
    if(await this.dataIsNotFresh()){
      const isInternetConnection = await NetInfo.fetch().then(state => state.isConnected);
      if(isInternetConnection){
        await this.tryToLoadDataFromInternet();
        return;
      }
    }
    await this.showForecastFromStorage();
  }

  async tryToLoadDataFromInternet() {
    try {
      const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,{
            'title': 'Location Access Required',
            'message': 'This App needs to Access your location'
          }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await Geolocation.getCurrentPosition(
            (position) => this.loadForecastWithGivenLocation(position),
            (error) => {console.log(error); this.loadForecastUsingLocationInStorage();},
            {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000}
        );
        return;
      }
    } catch (err) {
      console.log(err);
    }
    this.loadForecastUsingLocationInStorage();
  }

  componentDidMount = async () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if(state.isConnected){
        this.setState({noInternetConnection: false});
      } else {
        this.setState({noInternetConnection: true});
      }
    });

    try{
      const isStorage = await AsyncStorage.getItem('@is_storage');
      if(isStorage === null){
        // first app launch -> load from internet
        this.firstAppLaunchForecastLoading();
      } else {
        this.normalAppLaunch();
      }
    } catch(e) {
      console.log(e);
    }
  };

  async loadForecastWithGivenLocation(position){
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const location = await getLocationDetails(longitude, latitude);
    this.setState({loadingState: 'Loading forecast...'});
    this.loadInitialForecast(location)
  }

  async loadInitialForecast(location){
    let initialForecast = await fetchRootForecast(location.latitude, location.longitude);
    this.props.setInitialForecast(initialForecast, location);
    this.setState({isInitialForecastLoaded: true});
  }

  async loadForecastUsingLocationInStorage(){
    try {
      const value = await AsyncStorage.getItem(ACTIVE_LOCATION_STORAGE);
      if(value !== null) {
        const location = JSON.parse(value);
        this.loadInitialForecast(location);
        return;
      }
    } catch(e) {
      console.log(e);
    }
    this.setState({isSearchLocationWindow: true})
  }

  loadForecastFromSearchComponent = async (location) => {
    const locationEntity = {
      longitude: location.geometry.coordinates[0],
      latitude: location.geometry.coordinates[1],
      city: location.properties.name,
      country: location.properties.country,
    };
    this.setState({isSearchLocationWindow: false, loadingState: 'Loading forecast...'});
    this.loadInitialForecast(locationEntity)
  };

  render() {
    return (
      <View style={{flex: 1}}>
        {
          this.state.isInitialForecastLoaded ?
            (<MainPage />)
          :
            (<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <GeneralStatusBar/>
              <LottieView
                  style={{height: 200}}
                  source={require('../../assets/lottie/loading')}
                  autoPlay
                  loop/>
              <CustomText style={{fontSize: 25}}>{this.state.loadingState}</CustomText>
              {this.state.isSearchLocationWindow &&
              <View style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'white', paddingTop: 20}}>
                <CustomText style={{fontSize: 25, marginHorizontal: 10, marginTop: 20}}>Tell us your location</CustomText>
                <InitLocationSearchComponent loadForecast={this.loadForecastFromSearchComponent}/>
              </View>}
            </View>)
        }
        {this.state.noInternetConnection &&
            <View style={{position: 'absolute', bottom: 0, left: 0, width: '100%', height: '8%', backgroundColor: '#CC2A30', justifyContent: 'center', paddingLeft: 20}}>
              <CustomText style={{fontSize: 25, color: '#eee'}}>
                no internet connection ...
              </CustomText>
            </View>
        }
      </View>)
  }
}

function mapStateToProps(state) {
  return {
    activeLocation: state.activeLocation,
    homeLocation: state.homeLocation,
  };
}

function mapDispatcherToProps(dispatch) {
  return {
    setActiveLocation: activeLocation => dispatch({type: 'ACTIVE_LOCATION', payload: activeLocation}),
    setInitialForecast: (rootForecast, location, saveToStorage=true) => dispatch({type: 'ROOT_FORECAST', payload: {forecast: rootForecast, location: location, saveToStorage: saveToStorage}}),
  };
}

export default connect(
  mapStateToProps,
  mapDispatcherToProps,
)(InitLoader);
