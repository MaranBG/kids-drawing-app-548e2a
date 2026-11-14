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

function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 0,
) {
  ctx.beginPath()
  if (radius > 0) ctx.roundRect(x, y, w, h, radius)
  else ctx.rect(x, y, w, h)
  ctx.stroke()
}

/** A wheel: tyre plus hub. */
function wheel(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  circle(ctx, x, y, r)
  circle(ctx, x, y, r * 0.4)
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ellipse(ctx, x, y, 70, 32)
  ellipse(ctx, x + 50, y - 18, 50, 30)
}

function sun(ctx: CanvasRenderingContext2D, x: number, y: number, r = 50) {
  circle(ctx, x, y, r)
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4
    line(
      ctx,
      x + Math.cos(a) * (r + 18),
      y + Math.sin(a) * (r + 18),
      x + Math.cos(a) * (r + 45),
      y + Math.sin(a) * (r + 45),
    )
  }
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
  {
    id: 'car',
    name: 'Car',
    draw: (ctx) => {
      line(ctx, 0, 632, 1000, 632)
      sun(ctx, 860, 120)
      cloud(ctx, 150, 120)
      poly(ctx, [
        [320, 420],
        [395, 295],
        [620, 295],
        [710, 420],
      ])
      poly(ctx, [
        [352, 408],
        [408, 318],
        [495, 318],
        [495, 408],
      ])
      poly(ctx, [
        [518, 318],
        [605, 318],
        [668, 408],
        [518, 408],
      ])
      rect(ctx, 190, 420, 620, 140, 45)
      line(ctx, 507, 420, 507, 545)
      rect(ctx, 530, 445, 45, 16, 8)
      ellipse(ctx, 785, 470, 16, 24)
      rect(ctx, 192, 455, 22, 40, 6)
      wheel(ctx, 330, 562, 70)
      wheel(ctx, 670, 562, 70)
    },
  },
  {
    id: 'fire-truck',
    name: 'Fire Truck',
    draw: (ctx) => {
      line(ctx, 0, 620, 1000, 620)
      cloud(ctx, 160, 110)
      cloud(ctx, 780, 90)
      rect(ctx, 170, 235, 440, 32, 10)
      for (let x = 215; x < 600; x += 50) line(ctx, x, 235, x, 267)
      rect(ctx, 380, 267, 24, 33)
      rect(ctx, 140, 300, 480, 240, 14)
      rect(ctx, 180, 340, 115, 140, 10)
      rect(ctx, 323, 340, 115, 140, 10)
      rect(ctx, 466, 340, 115, 140, 10)
      poly(ctx, [
        [620, 540],
        [620, 255],
        [765, 255],
        [860, 375],
        [860, 540],
      ])
      poly(ctx, [
        [648, 282],
        [750, 282],
        [820, 372],
        [648, 372],
      ])
      rect(ctx, 670, 225, 60, 30, 10)
      rect(ctx, 670, 400, 40, 14, 7)
      ellipse(ctx, 835, 430, 14, 20)
      rect(ctx, 860, 485, 35, 55, 8)
      wheel(ctx, 280, 552, 66)
      wheel(ctx, 730, 552, 66)
    },
  },
  {
    id: 'train',
    name: 'Train',
    draw: (ctx) => {
      line(ctx, 0, 625, 1000, 625)
      for (let x = 20; x < 1000; x += 80) rect(ctx, x, 625, 40, 30, 4)
      circle(ctx, 385, 175, 34)
      circle(ctx, 445, 115, 44)
      circle(ctx, 530, 65, 30)
      rect(ctx, 320, 215, 120, 32, 10)
      rect(ctx, 347, 247, 66, 93)
      rect(ctx, 540, 195, 240, 35, 12)
      rect(ctx, 560, 230, 200, 290)
      rect(ctx, 600, 270, 120, 100, 10)
      rect(ctx, 280, 340, 280, 180, 20)
      line(ctx, 390, 340, 390, 520)
      line(ctx, 470, 340, 470, 520)
      circle(ctx, 320, 395, 22)
      poly(ctx, [
        [280, 445],
        [280, 545],
        [200, 545],
      ])
      ctx.beginPath()
      ctx.moveTo(780, 345)
      ctx.quadraticCurveTo(810, 290, 840, 345)
      ctx.quadraticCurveTo(870, 290, 900, 345)
      ctx.quadraticCurveTo(930, 290, 950, 345)
      ctx.closePath()
      ctx.stroke()
      rect(ctx, 780, 345, 170, 175, 14)
      line(ctx, 760, 495, 780, 495)
      wheel(ctx, 360, 565, 55)
      wheel(ctx, 480, 565, 55)
      wheel(ctx, 665, 552, 70)
      wheel(ctx, 820, 582, 40)
      wheel(ctx, 910, 582, 40)
    },
  },
  {
    id: 'airplane',
    name: 'Airplane',
    draw: (ctx) => {
      sun(ctx, 650, 105, 40)
      cloud(ctx, 140, 100)
      cloud(ctx, 840, 140)
      cloud(ctx, 160, 600)
      cloud(ctx, 760, 620)
      poly(ctx, [
        [465, 345],
        [545, 345],
        [495, 210],
        [450, 210],
      ])
      poly(ctx, [
        [190, 350],
        [150, 200],
        [225, 200],
        [320, 342],
      ])
      ctx.beginPath()
      ctx.moveTo(180, 345)
      ctx.lineTo(720, 320)
      ctx.quadraticCurveTo(860, 330, 880, 385)
      ctx.quadraticCurveTo(860, 440, 720, 445)
      ctx.lineTo(220, 420)
      ctx.quadraticCurveTo(160, 390, 180, 345)
      ctx.closePath()
      ctx.stroke()
      poly(ctx, [
        [760, 340],
        [815, 345],
        [845, 375],
        [760, 375],
      ])
      for (let x = 320; x <= 650; x += 55) circle(ctx, x, 372, 15)
      ellipse(ctx, 215, 400, 75, 18)
      poly(ctx, [
        [420, 415],
        [560, 420],
        [470, 590],
        [400, 590],
      ])
      rect(ctx, 690, 345, 34, 70, 10)
    },
  },
  {
    id: 'sailboat',
    name: 'Sailboat',
    draw: (ctx) => {
      sun(ctx, 860, 120)
      cloud(ctx, 140, 130)
      ctx.beginPath()
      ctx.moveTo(200, 230)
      ctx.quadraticCurveTo(220, 205, 240, 230)
      ctx.quadraticCurveTo(260, 205, 280, 230)
      ctx.stroke()
      rect(ctx, 490, 100, 15, 420)
      poly(ctx, [
        [505, 100],
        [575, 120],
        [505, 140],
      ])
      poly(ctx, [
        [478, 160],
        [478, 500],
        [255, 500],
      ])
      poly(ctx, [
        [517, 180],
        [517, 500],
        [725, 500],
      ])
      poly(ctx, [
        [210, 520],
        [790, 520],
        [705, 625],
        [295, 625],
      ])
      for (const x of [360, 500, 640]) circle(ctx, x, 565, 18)
      ctx.beginPath()
      ctx.moveTo(0, 610)
      for (let x = 0; x < 1000; x += 125) {
        ctx.quadraticCurveTo(x + 62, 570, x + 125, 610)
      }
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, 690)
      for (let x = 0; x < 1000; x += 125) {
        ctx.quadraticCurveTo(x + 62, 650, x + 125, 690)
      }
      ctx.stroke()
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
