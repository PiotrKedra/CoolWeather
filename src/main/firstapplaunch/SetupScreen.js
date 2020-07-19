import React from "react";
import {ScrollView, View, Image, Pressable, StyleSheet, Dimensions, ToastAndroid, Appearance} from "react-native";
import GeneralStatusBar from "../components/GeneralStatusBar";
import CustomText from "../components/CustomText";
import {getSystemTheme} from "../theme/Theme";
import ThemeModal from "./setupmodals/ThemeModal";

class SetupScreen extends React.PureComponent{

    state = {
        themeId: 'system',
        theme: getSystemTheme(),
        isThemeModal: false
    };

    setTheme = (themeId, theme) => {
        this.setState({themeId: themeId, theme: theme});
    };

    setIsThemeModal = (value) => {
        this.setState({isThemeModal: value})
    };

    render() {
        return (
            <View style={{flex: 1, backgroundColor: this.state.theme.mainColor}}>
                <ScrollView>
                    <GeneralStatusBar opacity={0}/>
                    <View style={{justifyContent: 'center', marginLeft: '10%', paddingBottom: 20, marginTop: 20}}>
                        <CustomText style={{fontSize: 35, color: this.state.theme.mainText}}>Choose what you like!</CustomText>
                        <CustomText style={{fontSize: 20, color: this.state.theme.softText}}>or keep default, you can change it later.</CustomText>
                    </View>
                    <View style={{justifyContent: 'center', paddingHorizontal: '10%'}}>
                        <View>
                            <CustomText style={{fontSize: 20, color: '#2c82c9', paddingBottom: 5, borderBottomWidth: 1, borderColor: this.state.theme.softBackgroundColor}}>settings</CustomText>
                        </View>
                        <Pressable style={styles.settingView}
                                   onPress={() => ToastAndroid.show('coming soon...', ToastAndroid.SHORT)}
                                   android_ripple={{color: '#ddd'}}>
                            <Image style={[styles.settingIcon, {tintColor: this.state.theme.mainText}]} source={require('../../../assets/images/icons/provider.png')}/>
                            <View>
                                <CustomText style={[styles.settingTitle, {color: this.state.theme.mainText}]}>weather provider</CustomText>
                                <CustomText style={[styles.settingInfo, {color: this.state.theme.softText}]}>open weather map</CustomText>
                            </View>
                        </Pressable>
                        <Pressable style={styles.settingView}
                                   onPress={() => ToastAndroid.show('coming soon...', ToastAndroid.SHORT)}
                                   android_ripple={{color: '#ddd'}}>
                            <Image style={[styles.settingIcon, {tintColor: this.state.theme.mainText}]} source={require('../../../assets/images/icons/notifications.png')}/>
                            <View>
                                <CustomText style={[styles.settingTitle, {color: this.state.theme.mainText}]}>notifications</CustomText>
                                <CustomText style={[styles.settingInfo, {color: this.state.theme.softText}]}>all disabled</CustomText>
                            </View>
                        </Pressable>
                        <Pressable style={styles.settingView}
                                   onPress={() => ToastAndroid.show('coming soon...', ToastAndroid.SHORT)}
                                   android_ripple={{color: '#ddd'}}>
                            <Image style={[styles.settingIcon, {tintColor: this.state.theme.mainText}]} source={require('../../../assets/images/icons/units.png')}/>
                            <View>
                                <CustomText style={[styles.settingTitle, {color: this.state.theme.mainText}]}>weather units</CustomText>
                                <CustomText style={[styles.settingInfo, {color: this.state.theme.softText}]}>°C, km/h ...</CustomText>
                            </View>
                        </Pressable>
                        <View>
                            <CustomText style={{fontSize: 20, color: '#2c82c9', marginTop: 20, paddingBottom: 5, borderBottomWidth: 1, borderColor: this.state.theme.softBackgroundColor}}>appearance</CustomText>
                        </View>
                        <Pressable style={styles.settingView}
                                   onPress={() => this.setState({isThemeModal: true})}
                                   android_ripple={{color: '#ddd'}}>
                            <Image style={[styles.settingIcon, {tintColor: this.state.theme.mainText}]} source={require('../../../assets/images/icons/theme.png')}/>
                            <View>
                                <CustomText style={[styles.settingTitle, {color: this.state.theme.mainText}]}>theme</CustomText>
                                <CustomText style={[styles.settingInfo, {color: this.state.theme.softText}]}>
                                    {this.state.themeId} theme {this.state.themeId==='system' ? '(' + this.state.theme.id + ')' : null}
                                </CustomText>
                            </View>
                        </Pressable>
                        <Pressable style={styles.settingView}
                                   onPress={() => ToastAndroid.show('coming soon...', ToastAndroid.SHORT)}
                                   android_ripple={{color: '#ddd'}}>
                            <Image style={[styles.settingIcon, {tintColor: this.state.theme.mainText}]} source={require('../../../assets/images/icons/font.png')}/>
                            <View>
                                <CustomText style={[styles.settingTitle, {color: this.state.theme.mainText}]}>font</CustomText>
                                <CustomText style={[styles.settingInfo, {color: this.state.theme.softText}]}>neucha</CustomText>
                            </View>
                        </Pressable>
                    </View>
                </ScrollView>
                <View style={{flexDirection: 'row', paddingBottom: 15}}>
                    <View style={{flex: 1}}/>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <CustomText style={{fontSize: 17, color: '#777'}}>2/3</CustomText>
                    </View>
                    <Pressable style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end'}}
                               android_ripple={{color: '#ddd'}}
                               onPress={() => this.props.navigation.navigate('FirstAppLaunch', {themeId: this.state.themeId, theme: this.state.theme})}
                    >
                        <CustomText style={{fontSize: 30, color: '#2c82c9', paddingRight: Dimensions.get('window').width/10}}>next</CustomText>
                    </Pressable>
                </View>
                <ThemeModal isVisible={this.state.isThemeModal} setVisible={this.setIsThemeModal} themeId={this.state.themeId} theme={this.state.theme} setTheme={this.setTheme}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({

    settingView: {flexDirection: 'row', alignItems: 'center', marginTop: 20, borderRadius: 10},
    settingIcon: {width: 40, height: 40, marginRight: 20},
    settingTitle: {fontSize: 20},
    settingInfo: {fontSize: 17, color: '#777'}
});

export default SetupScreen;