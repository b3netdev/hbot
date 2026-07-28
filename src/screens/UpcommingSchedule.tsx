import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Schedule from "../assets/schedule.png"
import Button from '../components/Button'
import { MoveRight } from 'lucide-react-native'
import { colors } from '../utils/theme'
import useAppNavigation from '../hooks/useAppNavigation'

const UpcommingSchedule = () => {
    const navigation = useAppNavigation()

    const HandleNavigation = () => {
        navigation.navigate('CreateSchedule')
    }
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 15 }}>
            <Image source={Schedule} style={{ height: 250, width: 250 }} />
            <View>

                <Text style={{ fontWeight: '700', fontSize: 18, opacity: 0.7 }}>Stay on track with your therapy</Text>
                <Text style={{ fontWeight: '500', opacity: 0.7 }}>Log your HBOT sesions, schedule future appointments,</Text>
                <Text style={{ fontWeight: '500', opacity: 0.6 }}>and monitor your progress- all in one place</Text>
            </View>
            <Button
                title='Get Started'
                style={{ borderRadius: 10 }}
                onPress={HandleNavigation}
                buttonColor='gradient'
                rightIcon={
                    <MoveRight
                        size={21}
                        color={colors.WHITE}
                        strokeWidth={2}

                    />
                }
            />
        </View>
    )
}

export default UpcommingSchedule

const styles = StyleSheet.create({})