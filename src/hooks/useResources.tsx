import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import api from '../utils/Api'

const useResources = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, serError] = useState<string | null>(null)


    const getEducationalResources = async () => {
        setLoading(true)
        try {
            const response = await api.get(`https://rss.app/feeds/v1.1/Xi2scovWVil7jwVK.json`)
            if (response.status == 200 && response.data && response.data.items.length > 0) return response.data.items
            return []
        }
        catch (error) {
            serError("Failed to fetch data ")
            return [];
        }
        finally {
            setLoading(false)
        }
    }

    return { getEducationalResources, loading, error }
}

export default useResources

const styles = StyleSheet.create({})