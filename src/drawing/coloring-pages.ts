/**
 * Coloring pages are drawn as line art in a 1000 × 750 design space and scaled
 * to whatever canvas they are rendered on. Every shape is closed so the bucket
 * tool can fill each area cleanly.
 */

export type ColoringPage = {
  id: string
  name: string
  draw: (ctx: CanvasRenderingContext2D) => void
}

export const DESIGN_WIDTH = 1000
export const DESIGN_HEIGHT = 750

function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rotation = 0,
) {
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2)
  ctx.stroke()
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ellipse(ctx, x, y, r, r)
}

function poly(ctx: CanvasRenderingContext2D, points: Array<[number, number]>) {
  ctx.beginPath()
  points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.closePath()
  ctx.stroke()
}

function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function star(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outer: number,
  inner: number,
) {
  const points: Array<[number, number]> = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    points.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
  }
  poly(ctx, points)
}

export const coloringPages: Array<ColoringPage> = [
  {
    id: 'cat',
    name: 'Kitty',
    draw: (ctx) => {
      poly(ctx, [
        [340, 262],
        [345, 120],
        [455, 208],
      ])
      poly(ctx, [
        [660, 262],
        [655, 120],
        [545, 208],
      ])
      ellipse(ctx, 500, 400, 230, 200)
      ellipse(ctx, 420, 360, 35, 48)
      ellipse(ctx, 580, 360, 35, 48)
      circle(ctx, 430, 345, 12)
      circle(ctx, 590, 345, 12)
      poly(ctx, [
        [475, 430],
        [525, 430],
        [500, 460],
      ])
      ctx.beginPath()
      ctx.arc(470, 470, 30, 0.1 * Math.PI, 0.9 * Math.PI)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(530, 470, 30, 0.1 * Math.PI, 0.9 * Math.PI)
      ctx.stroke()
      line(ctx, 300, 420, 410, 445)
      line(ctx, 300, 470, 410, 465)
      line(ctx, 700, 420, 590, 445)
      line(ctx, 700, 470, 590, 465)
      ellipse(ctx, 380, 520, 40, 22)
      ellipse(ctx, 620, 520, 40, 22)
    },
  },
  {
    id: 'house',
    name: 'House',
    draw: (ctx) => {
      line(ctx, 0, 650, 1000, 650)
      poly(ctx, [
        [590, 220],
        [590, 110],
        [650, 110],
        [650, 270],
      ])
      poly(ctx, [
        [300, 360],
        [700, 360],
        [700, 650],
        [300, 650],
      ])
      poly(ctx, [
        [250, 360],
        [500, 150],
        [750, 360],
      ])
      poly(ctx, [
        [450, 500],
        [550, 500],
        [550, 650],
        [450, 650],
      ])
      circle(ctx, 530, 580, 9)
      poly(ctx, [
        [335, 410],
        [415, 410],
        [415, 480],
        [335, 480],
      ])
      line(ctx, 375, 410, 375, 480)
      line(ctx, 335, 445, 415, 445)
      poly(ctx, [
        [585, 410],
        [665, 410],
        [665, 480],
        [585, 480],
      ])
      line(ctx, 625, 410, 625, 480)
      line(ctx, 585, 445, 665, 445)
      circle(ctx, 500, 280, 40)
      circle(ctx, 860, 130, 60)
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4
        line(
          ctx,
          860 + Math.cos(a) * 80,
          130 + Math.sin(a) * 80,
          860 + Math.cos(a) * 115,
          130 + Math.sin(a) * 115,
        )
      }
      ellipse(ctx, 140, 120, 80, 40)
      ellipse(ctx, 200, 100, 60, 35)
      poly(ctx, [
        [130, 650],
        [130, 520],
        [160, 520],
        [160, 650],
      ])
      circle(ctx, 145, 460, 80)
      ellipse(ctx, 850, 640, 70, 30)
    },
  },
  {
    id: 'fish',
    name: 'Fish',
    draw: (ctx) => {
      poly(ctx, [
        [700, 375],
        [880, 230],
        [850, 375],
        [880, 520],
      ])
      ellipse(ctx, 460, 375, 270, 160)
      ctx.beginPath()
      ctx.moveTo(400, 220)
      ctx.quadraticCurveTo(470, 110, 580, 235)
      ctx.stroke()
      circle(ctx, 300, 340, 34)
      circle(ctx, 290, 335, 12)
      ctx.beginPath()
      ctx.arc(230, 400, 30, 0.1 * Math.PI, 0.6 * Math.PI)
      ctx.stroke()
      for (const x of [420, 510, 600]) {
        ctx.beginPath()
        ctx.moveTo(x, 235)
        ctx.quadraticCurveTo(x + 50, 375, x, 515)
        ctx.stroke()
      }
      ellipse(ctx, 470, 440, 50, 28, -0.4)
      circle(ctx, 150, 220, 25)
      circle(ctx, 110, 140, 18)
      circle(ctx, 160, 75, 12)
      ctx.beginPath()
      ctx.moveTo(0, 690)
      ctx.quadraticCurveTo(250, 640, 500, 690)
      ctx.quadraticCurveTo(750, 740, 1000, 690)
      ctx.stroke()
      poly(ctx, [
        [800, 690],
        [790, 590],
        [820, 620],
        [830, 560],
        [855, 690],
      ])
    },
  },
  {
    id: 'flower',
    name: 'Flower',
    draw: (ctx) => {
      ctx.beginPath()
      ctx.moveTo(490, 360)
      ctx.lineTo(490, 600)
      ctx.lineTo(510, 600)
      ctx.lineTo(510, 360)
      ctx.stroke()
      ellipse(ctx, 420, 500, 70, 28, 0.5)
      ellipse(ctx, 580, 470, 70, 28, -0.5)
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 2
        ellipse(
          ctx,
          500 + Math.cos(a) * 135,
          260 + Math.sin(a) * 135,
          70,
          44,
          a,
        )
      }
      circle(ctx, 500, 260, 65)
      poly(ctx, [
        [380, 600],
        [620, 600],
        [590, 720],
        [410, 720],
      ])
      line(ctx, 390, 640, 610, 640)
      star(ctx, 160, 160, 60, 25)
      star(ctx, 850, 200, 45, 20)
      // Little bee
      ellipse(ctx, 820, 470, 50, 32)
      ellipse(ctx, 800, 425, 25, 35, -0.4)
      ellipse(ctx, 840, 425, 25, 35, 0.4)
      line(ctx, 805, 440, 805, 500)
      line(ctx, 830, 440, 830, 500)
    },
  },
  {
    id: 'rocket',
    name: 'Rocket',
    draw: (ctx) => {
      poly(ctx, [
        [430, 470],
        [340, 590],
        [430, 560],
      ])
      poly(ctx, [
        [570, 470],
        [660, 590],
        [570, 560],
      ])
      ctx.beginPath()
      ctx.moveTo(460, 600)
      ctx.quadraticCurveTo(500, 740, 540, 600)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(500, 70)
      ctx.quadraticCurveTo(600, 170, 570, 600)
      ctx.lineTo(430, 600)
      ctx.quadraticCurveTo(400, 170, 500, 70)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(452, 180)
      ctx.quadraticCurveTo(500, 160, 548, 180)
      ctx.stroke()
      circle(ctx, 500, 300, 50)
      circle(ctx, 500, 300, 30)
      line(ctx, 438, 450, 562, 450)
      star(ctx, 170, 150, 50, 22)
      star(ctx, 820, 120, 40, 18)
      star(ctx, 860, 420, 55, 24)
      star(ctx, 150, 460, 35, 15)
      circle(ctx, 780, 620, 70)
      circle(ctx, 760, 600, 15)
      circle(ctx, 805, 650, 12)
      ellipse(ctx, 780, 620, 120, 25, -0.3)
    },
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    draw: (ctx) => {
      ellipse(ctx, 360, 270, 150, 120, -0.5)
      ellipse(ctx, 640, 270, 150, 120, 0.5)
      ellipse(ctx, 390, 470, 110, 90, 0.5)
      ellipse(ctx, 610, 470, 110, 90, -0.5)
      circle(ctx, 340, 260, 45)
      circle(ctx, 660, 260, 45)
      circle(ctx, 390, 480, 30)
      circle(ctx, 610, 480, 30)
      ellipse(ctx, 500, 380, 30, 180)
      ctx.beginPath()
      ctx.moveTo(490, 205)
      ctx.quadraticCurveTo(460, 120, 410, 100)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(510, 205)
      ctx.quadraticCurveTo(540, 120, 590, 100)
      ctx.stroke()
      circle(ctx, 405, 98, 16)
      circle(ctx, 595, 98, 16)
      line(ctx, 472, 320, 528, 320)
      line(ctx, 472, 400, 528, 400)
      line(ctx, 475, 480, 525, 480)
      ellipse(ctx, 150, 650, 90, 40)
      ellipse(ctx, 850, 660, 90, 40)
    },
  },
]

/** Render a coloring page's outlines onto a canvas of any size. */
export function drawColoringPage(
  ctx: CanvasRenderingContext2D,
  page: ColoringPage,
  width: number,
  height: number,
  lineWidth = 7,
) {
  ctx.save()
  const scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT)
  ctx.translate(
    (width - DESIGN_WIDTH * scale) / 2,
    (height - DESIGN_HEIGHT * scale) / 2,
  )
  ctx.scale(scale, scale)
  ctx.strokeStyle = '#2b2440'
  ctx.lineWidth = lineWidth
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  page.draw(ctx)
  ctx.restore()
}
