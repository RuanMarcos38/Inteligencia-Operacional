export const brl = (value: number, compact = false) => new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', notation: compact ? 'compact' : 'standard', maximumFractionDigits: compact ? 1 : 2,
}).format(value)
export const pct = (value: number) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
export const num = (value: number) => value.toLocaleString('pt-BR')
