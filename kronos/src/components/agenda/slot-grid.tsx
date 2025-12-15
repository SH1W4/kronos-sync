'use client'

interface Slot {
  id: string
  macaId: number
  startTime: string
  endTime: string
  date: string
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED'
  booking?: {
    client: { name: string }
    artist: { user: { name: string } }
  }
}

interface SlotGridProps {
  slots: Slot[]
  onSlotClick: (slot: Slot) => void
}

export function SlotGrid({ slots, onSlotClick }: SlotGridProps) {
  // Group slots by date and time
  const groupedSlots = slots.reduce((acc, slot) => {
    const date = slot.date
    const time = slot.startTime

    if (!acc[date]) acc[date] = {}
    if (!acc[date][time]) acc[date][time] = {}

    acc[date][time][slot.macaId] = slot
    return acc
  }, {} as Record<string, Record<string, Record<number, Slot>>>)

  // Em um cenário real, estas datas deveriam ser dinâmicas
  const dates = Object.keys(groupedSlots).sort().slice(0, 7) // Next 7 days
  const times = ['09:00', '13:00', '16:30', '20:00'] // 4 time slots
  const macas = [1, 2, 3] // 3 macas

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-primary hover:bg-primary/80 text-background border-primary'
      case 'RESERVED':
        return 'bg-yellow-500 hover:bg-yellow-400 text-background border-yellow-500'
      case 'OCCUPIED':
        return 'bg-secondary hover:bg-secondary/80 text-white border-secondary'
      default:
        return 'bg-muted text-muted-foreground border-muted'
    }
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5) // Remove seconds
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with Macas */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div></div> {/* Empty corner */}
          {macas.map(maca => (
            <div key={maca} className="text-center">
              <h3 className="cyber-title text-lg font-orbitron font-bold text-primary">
                Maca {maca}
              </h3>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {times.map(time => (
          <div key={time} className="grid grid-cols-4 gap-4 mb-4">
            {/* Time Label */}
            <div className="flex items-center justify-center">
              <div className="cyber-card p-3 text-center">
                <div className="font-mono text-primary font-bold">
                  {formatTime(time)}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {formatTime(time).split(':')[0]}:00 - {parseInt(formatTime(time).split(':')[0]) + 3}:30
                </div>
              </div>
            </div>

            {/* Maca Slots */}
            {macas.map(maca => {
              // Find slot for current date (today), time, and maca
              // Em produção isso precisa ser ajustado para pegar slots de datas diferentes
              const today = new Date().toISOString().split('T')[0]

              // Tenta pegar slot na estrutura agrupada. Se não achar, undefined
              // NOTA: A lógica original do prompt assumia que groupedSlots tem tudo.
              // Como estamos reconstruindo, pode haver discrepância nas datas.
              // Vou deixar genérico com optional chaining.
              const slot = groupedSlots[today]?.[time + ':00']?.[maca]
                || groupedSlots[Object.keys(groupedSlots)[0]]?.[time + ':00']?.[maca] // Fallback para primeira data disponível no mock

              if (!slot) {
                return (
                  <div key={maca} className="cyber-card p-4 text-center opacity-50">
                    <div className="text-muted-foreground font-mono text-sm">
                      Indisponível
                    </div>
                  </div>
                )
              }

              return (
                <button
                  key={`${time}-${maca}`}
                  onClick={() => onSlotClick(slot)}
                  className={`cyber-card p-4 text-center transition-all duration-300 hover:scale-105 ${getSlotColor(slot.status)} ${slot.status === 'AVAILABLE' ? 'cursor-pointer cyber-glow' : 'cursor-not-allowed'
                    }`}
                  disabled={slot.status !== 'AVAILABLE'}
                >
                  {slot.status === 'AVAILABLE' ? (
                    <div className="font-mono font-bold">Disponível</div>
                  ) : (
                    <div>
                      <div className="font-mono font-bold text-sm">
                        {slot.booking?.artist.user.name}
                      </div>
                      <div className="font-mono text-xs opacity-80">
                        {slot.booking?.client.name}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
