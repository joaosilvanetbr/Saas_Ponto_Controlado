interface Props {
  minutosFeitos?: number
  jornadaMinutos?: number
}

export default function BarraProgressoJornada({ minutosFeitos = 0, jornadaMinutos = 480 }: Props) {
  const progresso = jornadaMinutos > 0 ? Math.min(100, (minutosFeitos / jornadaMinutos) * 100) : 0

  const marcadores: number[] = []
  for (let m = 60; m <= jornadaMinutos; m += 60) {
    marcadores.push(m)
  }

  return (
    <div style={{ position: 'relative', paddingBottom: 20 }}>
      <div style={{
        width: '100%',
        height: 4,
        background: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-pill)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progresso}%`,
          height: '100%',
          background: 'var(--color-accent)',
          borderRadius: 'var(--radius-pill)',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {marcadores.map((m) => (
        <span
          key={m}
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${(m / jornadaMinutos) * 100}%`,
            transform: 'translateX(-50%)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)',
            fontFamily: 'var(--font-native)',
          }}
        >
          {Math.floor(m / 60)}h
        </span>
      ))}
    </div>
  )
}