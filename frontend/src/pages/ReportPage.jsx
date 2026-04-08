// TODO: display full report with score, detections, AI summary
import { useParams } from 'react-router-dom'

export default function ReportPage() {
  const { id } = useParams()
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Report {id} — coming soon</p>
    </div>
  )
}
