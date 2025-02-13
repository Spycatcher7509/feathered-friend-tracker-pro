
import { BirdPrediction } from "./types"

interface BirdPredictionsProps {
  predictions: BirdPrediction[]
}

export function BirdPredictions({ predictions }: BirdPredictionsProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Possible Matches:</h3>
      <div className="rounded-lg border p-4 space-y-2">
        {predictions.map((prediction, index) => (
          <div key={index} className="flex justify-between">
            <span>{prediction.label}</span>
            <span className="text-gray-500">
              {(prediction.score * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
