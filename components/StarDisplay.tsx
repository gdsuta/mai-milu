type Props = {
  avgScore: number | null
  totalRatings: number
  size?: 'sm' | 'md'
}

export default function StarDisplay({ avgScore, totalRatings, size = 'sm' }: Props) {
  if (!avgScore || totalRatings === 0) {
    return (
      <span className="text-xs text-gray-400 italic">Belum ada ulasan</span>
    )
  }

  const starSize = size === 'md' ? 'text-base' : 'text-xs'
  const textSize = size === 'md' ? 'text-sm' : 'text-xs'

  // Render 5 stars, filled proportionally
  const stars = [1, 2, 3, 4, 5].map((s) => {
    if (avgScore >= s) return '★'         // full
    if (avgScore >= s - 0.5) return '⯨'  // half (unicode half star)
    return '☆'                            // empty
  })

  return (
    <span className={`inline-flex items-center gap-0.5 ${textSize}`}>
      <span className={`${starSize} text-yellow-400 tracking-tight`}>{stars.join('')}</span>
      <span className="font-bold text-gray-700 ml-1">{avgScore.toFixed(1)}</span>
      <span className="text-gray-400">({totalRatings})</span>
    </span>
  )
}
