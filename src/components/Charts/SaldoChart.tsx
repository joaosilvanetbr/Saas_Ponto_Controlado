import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { calcularSaldoDia, calcularSaldoDiaMarcacoes, getJornadaFinal } from '../../utils/calcHoras'
import { formatarMinutos } from '../../utils/reportCalculations'
import type { Ponto, ConfigUsuario } from '../../types'

interface Props {
  registros: Ponto[]
  config: ConfigUsuario
}

export default function SaldoChart({ registros, config }: Props) {
  if (!registros || registros.length === 0) return null

  const jornadaFinal = getJornadaFinal(config)

  const pontos = registros
    .sort((a, b) => a.data.localeCompare(b.data))
    .reduce<{ label: string; acumulado: number; saldoDia: number }[]>((acc, ponto, i) => {
      const saldoDia = ponto.marcacoes && ponto.marcacoes.length > 0
        ? calcularSaldoDiaMarcacoes(ponto.marcacoes, jornadaFinal)
        : calcularSaldoDia(ponto, jornadaFinal, config.intervaloMinutos || 0)
      const acumulado = (acc[i - 1]?.acumulado ?? 0) + saldoDia
      const label = ponto.data.slice(8)
      acc.push({ label, acumulado, saldoDia })
      return acc
    }, [])

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      boxShadow: 'var(--shadow-card)',
    }}>
      <p style={{
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        color: 'var(--color-text)',
        marginBottom: 'var(--space-3)',
        marginTop: 0,
      }}>
        Evolução do Saldo
      </p>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={pontos}>
          <defs>
            <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            formatter={(v) => [formatarMinutos(v as number), 'Saldo']}
            labelFormatter={(l) => `Dia ${l}`}
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-divider)',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'var(--font-native)',
              color: 'var(--color-text)',
            }}
          />
          <Area
            type="monotone"
            dataKey="acumulado"
            stroke="var(--color-accent)"
            strokeWidth={2}
            fill="url(#colorAcumulado)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--color-accent)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}