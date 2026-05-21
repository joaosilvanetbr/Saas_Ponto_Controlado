/**
 * Script para gerar ícones PWA
 * Execute: npm run generate-icons
 * 
 * Necessita: npm install canvas
 */
import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

const GREEN = '#1A6B45'
const WHITE = '#FFFFFF'

function createIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  // Background
  ctx.fillStyle = GREEN
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.125)
  ctx.fill()
  
  // Clock circle
  ctx.strokeStyle = WHITE
  ctx.lineWidth = size * 0.047
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2)
  ctx.stroke()
  
  // Hour hand
  ctx.strokeStyle = WHITE
  ctx.lineWidth = size * 0.047
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(size / 2, size / 2)
  ctx.lineTo(size / 2, size * 0.273)
  ctx.stroke()
  
  // Minute hand
  ctx.lineWidth = size * 0.039
  ctx.beginPath()
  ctx.moveTo(size / 2, size / 2)
  ctx.lineTo(size * 0.664, size * 0.586)
  ctx.stroke()
  
  // Center dot
  ctx.fillStyle = WHITE
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.031, 0, Math.PI * 2)
  ctx.fill()
  
  // PC text
  ctx.fillStyle = WHITE
  ctx.font = `bold ${size * 0.094}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('PC', size / 2, size * 0.82)
  
  return canvas
}

// Generate icons
const icons = [
  { name: 'pwa-512.png', size: 512 },
  { name: 'pwa-192.png', size: 192 },
]

icons.forEach(({ name, size }) => {
  const canvas = createIcon(size)
  const buffer = canvas.toBuffer('image/png')
  writeFileSync(`./public/${name}`, buffer)
  console.log(`Generated: ${name} (${size}x${size})`)
})

console.log('Icons generated successfully!')