export interface CropBase {
    cropId: number
    cropName: string
    variety: string
    description: string
    rainProbabilityThreshold?: number
    highTempThreshold?: number
    lowTempThreshold?: number
    strongWindThreshold?: number
    highHumidityThreshold?: number
    stormWeatherCode?: number
}