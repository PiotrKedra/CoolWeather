import React from 'react';
import {View, StyleSheet, TouchableOpacity, ImageBackground, StatusBar,Image, ScrollView, Animated,FlatList} from 'react-native';
import Text from '../main/components/CustomText';
import Header from './menu/Header';
import FooterMenu from './menu/FooterMenu';
import BasicWeatherPanel from './weather/BasicWeatherPanel';
import DayPickerList from './components/DayPickerList';

export default class MainPage extends React.Component {

    state = {
        scroll: false,
        fontLoaded: false,
        days: [{date: 22, short: 'WEN'},{date: 23, short: 'THR'},{date: 24, short: 'FRI'},{date: 25, short: 'SUN'},{date: 26, short: 'SAT'},{date: 27, short: 'MON'}],
        locationOpacity: new Animated.Value(1)
    };

    onScrollNotTopMinimizeHeader = (event) => {
        const y = event.nativeEvent.contentOffset.y;
        if(y >= 5 && this.state.scroll===false){
            Animated.timing(this.state.locationOpacity, {
                toValue: 0,
                duration: 400
            }).start();
            this.setState({scroll: true});
        }
        if(y < 5 && this.state.scroll===true){
            Animated.timing(this.state.locationOpacity, {
                toValue: 1,
                duration: 400
            }).start();
            this.setState({scroll: false});
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
                        <DayPickerList days={this.state.days}/>
                        <BasicWeatherPanel/>

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
