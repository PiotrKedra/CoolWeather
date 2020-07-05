import React, {useState, useEffect} from "react";
import {Image, StyleSheet, TextInput, TouchableOpacity, View, ScrollView} from "react-native";
import CustomText from "../components/CustomText";
import {searchForLocationsByQuery} from "./LocationAutocompleteApi";
import AsyncStorage from "@react-native-community/async-storage";
import SUGGESTED_LOCATIONS from "./SugestedLocations";

const InitLocationSearchComponent = ({navigation, route}) => {

    const [locationInput, changeLocationInput] = useState("");
    const [locations, changeLocations] = useState([]);

    const [homeLocation, setHomeLocation] = useState(null);
    const [historyLocations, setHistoryLocations] = useState([]);

    useEffect(() => {
        AsyncStorage.getItem('@home_location').then(e => {if(e){setHomeLocation(JSON.parse(e))}});
        AsyncStorage.getItem('@history_locations').then(e => setHistoryLocations(e ? JSON.parse(e) : []));
    }, []);

    return (
        <View style={{flex: 1, backgroundColor: '#eee'}}>
            <View style={styles.overflowView}>
                <View style={styles.locationSearchViewInner}>
                    <Image
                        style={styles.locationSearchViewSearchImage}
                        source={require('../../../assets/images/icons/search2.png')}
                    />
                    <TextInput
                        style={styles.locationSearchViewTextInput}
                        placeholder="Search location"
                        onChangeText={text => searchForLocation(text, changeLocationInput, changeLocations)}
                        value={locationInput}
                        autoFocus={true}
                    />
                    <TouchableOpacity style={styles.locationSearchCancelButton}
                                      onPress={() => {changeLocationInput(""); changeLocations([])}}
                    >
                        <Image
                            style={styles.locationSearchCancelImage}
                            source={require('../../../assets/images/icons/cancel.png')}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="always">

                {locationInput.length <= 3 ?
                    (
                        homeLocation ?
                            renderHistoricalLocations(historyLocations, homeLocation, navigation)
                            :
                            <React.Fragment>
                                <CustomText style={{marginHorizontal: '5%', fontSize: 25, marginVertical: 5}}>Some suggestions:</CustomText>
                                {SUGGESTED_LOCATIONS.map(item => renderLocationItem(item, navigation, true))}
                            </React.Fragment>
                    )

                    :
                    locations.map(item => (
                        <TouchableOpacity key={item.properties.osm_id}
                                          style={styles.locationItem}
                                          onPress={() => {
                                              const location = parseLocation(item);
                                              navigation.replace('AppLauncher', {location: location, saveHomeLocation: route.params.saveHomeLocation});
                                              if(!route.params.saveHomeLocation)
                                                  addToHistory(location, historyLocations);
                                          }}
                        >
                            <Image
                                style={styles.locationItemImage}
                                source={require('../../../assets/images/icons/location-marker.png')}
                            />
                            <CustomText style={styles.locationItemText}>
                                {item.properties.name}, {item.properties.country}
                            </CustomText>
                        </TouchableOpacity>
                    ))
                }
            </ScrollView>
        </View>
    )
};

function renderHistoricalLocations(historyLocations, homeLocation, navigation){
    return (
        <React.Fragment>
            <TouchableOpacity style={{
                padding: 5,
                flexDirection: 'row',
            }}
                              onPress={() => navigation.replace('AppLauncher', {location: homeLocation, saveHomeLocation: false})}
            >
                <Image
                    style={{width: 25, height: 25, marginHorizontal: 5, marginLeft: 8, tintColor: '#2c82c9'}}
                    source={require('../../../assets/images/icons/home.png')}
                />
                <CustomText style={{
                    fontSize: 21,
                    flex: 9,
                    marginHorizontal: 12
                }}>{homeLocation.city}, {homeLocation.country}</CustomText>
            </TouchableOpacity>
            {historyLocations.map(l => renderLocationItem(l, navigation))}
        </React.Fragment>
    )
}

function renderLocationItem(location, navigation, saveHomeLocation=false){
    return (
        <TouchableOpacity key={location.latitude + location.longitude}
                          style={styles.locationItem}
                          onPress={() => navigation.replace('AppLauncher', {location: location, saveHomeLocation: saveHomeLocation})}
        >
            <Image
                style={styles.locationItemImage}
                source={require('../../../assets/images/icons/location-marker.png')}
            />
            <CustomText style={styles.locationItemText}>{location.city}, {location.country}</CustomText>
        </TouchableOpacity>
    )
}

function addToHistory(location, history) {
    history.push(location);
    try {
        AsyncStorage.setItem('@history_locations', JSON.stringify(removeDuplicates(history)));
    } catch (e) {
        console.log(e);
    }
}

function removeDuplicates(array) {
    let result = [];
    for(let i=0; i< array.length; ++i){
        if(!contains(array[i], result)){
            result.push(array[i]);
        }
    }
    return result;
}

function contains(ele, array){
    for(let i=0; i< array.length;++i){
        if(array[i].city === ele.city) return true;
    }
    return false;
}

function parseLocation(location){
    return {
        longitude: location.geometry.coordinates[0],
        latitude: location.geometry.coordinates[1],
        city: location.properties.name,
        country: location.properties.country,
    }
}

async function searchForLocation(query, changeLocationInput, changeLocations){
    changeLocationInput(query);
    if(query.length >= 3) {
        const locations = await searchForLocationsByQuery(query);
        changeLocations(locations);
    }
}

const styles = StyleSheet.create({
    overflowView: {
        overflow: 'hidden',
        paddingBottom: 1
    },
    locationSearchViewInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationSearchViewSearchImage: {
        height: 20,
        width: 20,
        marginLeft: '4.5%',
        marginRight: 5,
    },
    locationSearchViewTextInput: {
        backgroundColor: 'rgba(1,1,1,0.1)',
        fontFamily: 'Neucha-Regular',
        fontSize: 25,
        marginHorizontal: 10,
        paddingVertical: 0,
        marginVertical: 10,
        flex: 8,
        borderRadius: 3
    },
    locationSearchCancelButton: {
        flex: 1
    },
    locationSearchCancelImage: {
        height: 16,
        width: 16,
        tintColor: '#2c82c9'
    },
    scrollView: {
        width: '100%',
        height: '100%'
    },
    locationItem: {
        padding: 10,
        flexDirection: 'row'
    },
    locationItemImage: {
        width: 28,
        height: 28,
        marginHorizontal: 1,
        tintColor: '#2c82c9'
    },
    locationItemText: {
        fontSize: 21,
        flex: 9,
        marginHorizontal: 14
    },
});

export default InitLocationSearchComponent;
