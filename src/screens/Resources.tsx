import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import { colors } from '../utils/theme';
import Button from '../components/Button';
import MoveRight from 'lucide-react-native/icons/move-right';
import useAppNavigation from '../hooks/useAppNavigation';
export default function Resources() {
    const navigation = useAppNavigation()

    const buttonArray = [
        {
            title: "Educational Resources",
            path: "EducationalResources"
        },
        {
            title: "Chember Enquiry",
            path: "ChemberEnquiry"
        }
    ]
    const HandleNavigation = (data: any) => {
        navigation.navigate(data.path)
    }
    return (
        <>
            <Header
                radius={30}
                height={85}
                title='Resources'
                titleColor='#fff'
            />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                {
                    buttonArray?.map((data: any, index: any) => {
                        return (
                            <Button
                                key={index}
                                title={data.title}
                                buttonColor='gradient'
                                style={{ width: '80%' }}
                                onPress={() => HandleNavigation(data)}
                                rightIcon={
                                    <MoveRight
                                        size={21}
                                        color={colors.WHITE}
                                        strokeWidth={2}
                                    />
                                }
                            />
                        )
                    })
                }
            </View>
        </>
    );
}
