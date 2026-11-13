import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Camera,
  Eraser,
  ImagePlus,
  PaintBucket,
  Paintbrush,
  Pencil,
  Rainbow,
  Stamp,
  Undo2,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import {
  coloringPages,
  drawColoringPage,
  type ColoringPage,
} from '@/drawing/coloring-pages'
import { floodFill, hexToRgb } from '@/drawing/flood-fill'
import { sounds } from '@/drawing/sounds'
import { PicturePicker } from '@/components/picture-picker'

/** Fixed drawing resolution (4:3, like most tablets). Scaled to fit the screen. */
const WIDTH = 1600
const HEIGHT = 1200
const MAX_UNDO = 10

type ToolId = 'pencil' | 'brush' | 'rainbow' | 'bucket' | 'stamp' | 'eraser'

type Tool = {
  id: ToolId
  label: string
  icon: LucideIcon
  sizes?: [number, number, number]
}

const TOOLS: Array<Tool> = [
  { id: 'pencil', label: 'Pencil', icon: Pencil, sizes: [5, 10, 18] },
  { id: 'brush', label: 'Brush', icon: Paintbrush, sizes: [18, 34, 60] },
  { id: 'rainbow', label: 'Rainbow brush', icon: Rainbow, sizes: [14, 28, 48] },
  { id: 'bucket', label: 'Paint bucket', icon: PaintBucket },
  { id: 'stamp', label: 'Stamps', icon: Stamp, sizes: [80, 130, 200] },
  { id: 'eraser', label: 'Eraser', icon: Eraser, sizes: [28, 56, 100] },
]

const COLORS = [
  '#ef4444',
  '#f97316',
  '#facc15',
  '#84cc16',
  '#22c55e',
  '#38bdf8',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#fcd5b5',
  '#92400e',
  '#6b7280',
  '#1f1b2e',
  '#ffffff',
]

const STAMPS = ['⭐', '❤️', '🌸', '🦋', '🐶', '🐱', '🦄', '🌈', '☀️', '🍎', '🚗', '🎈']

const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'

type Point = { x: number; y: number }
type Snapshot = { image: ImageData; pageId: string | null }

export function DrawingBoard() {
  const areaRef = useRef<HTMLDivElement>(null)
  const paintRef = useRef<HTMLCanvasElement>(null)
  const outlineRef = useRef<HTMLCanvasElement>(null)
  const undoStack = useRef<Array<Snapshot>>([])
  const activePointer = useRef<number | null>(null)
  const points = useRef<Array<Point>>([])
  const hue = useRef(0)

  const [tool, setTool] = useState<ToolId>('brush')
  const [color, setColor] = useState(COLORS[6])
  const [sizeIndex, setSizeIndex] = useState(1)
  const [stamp, setStamp] = useState(STAMPS[0])
  const [pageId, setPageId] = useState<string | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [flashKey, setFlashKey] = useState(0)
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 })

  const currentTool = TOOLS.find((t) => t.id === tool)!
  const size = currentTool.sizes?.[sizeIndex] ?? 0

  const paintCtx = () =>
    paintRef.current?.getContext('2d', { willReadFrequently: true }) ?? null

  // --- Setup -------------------------------------------------------------

  useEffect(() => {
    const ctx = paintCtx()
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
  }, [])

  // Keep the 4:3 board as large as possible inside the available space.
  useEffect(() => {
    const area = areaRef.current
    if (!area) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const ratio = WIDTH / HEIGHT
      if (width / height > ratio) {
        setBoardSize({ width: height * ratio, height })
      } else {
        setBoardSize({ width, height: width / ratio })
      }
    })
    observer.observe(area)
    return () => observer.disconnect()
  }, [])

  const renderOutline = useCallback((id: string | null) => {
    const ctx = outlineRef.current?.getContext('2d', {
      willReadFrequently: true,
    })
    if (!ctx) return
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    const page = coloringPages.find((p) => p.id === id)
    if (page) drawColoringPage(ctx, page, WIDTH, HEIGHT)
  }, [])

  useEffect(() => renderOutline(pageId), [pageId, renderOutline])

  // --- Undo --------------------------------------------------------------

  const pushUndo = () => {
    const ctx = paintCtx()
    if (!ctx) return
    undoStack.current.push({
      image: ctx.getImageData(0, 0, WIDTH, HEIGHT),
      pageId,
    })
    if (undoStack.current.length > MAX_UNDO) undoStack.current.shift()
    setCanUndo(true)
  }

  const undo = useCallback(() => {
    const snap = undoStack.current.pop()
    const ctx = paintCtx()
    if (!snap || !ctx) return
    ctx.putImageData(snap.image, 0, 0)
    setPageId(snap.pageId)
    setCanUndo(undoStack.current.length > 0)
    sounds.undo()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo])

  // --- Drawing -----------------------------------------------------------

  const toCanvas = (e: { clientX: number; clientY: number }): Point => {
    const rect = paintRef.current!.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * HEIGHT,
    }
  }

  const applyStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = size
    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
    let stroke = color
    if (tool === 'eraser') stroke = '#ffffff'
    if (tool === 'rainbow') {
      hue.current = (hue.current + 3) % 360
      stroke = `hsl(${hue.current} 90% 58%)`
    }
    if (tool === 'brush') {
      ctx.shadowBlur = size * 0.45
      ctx.shadowColor = color
    }
    ctx.strokeStyle = stroke
    ctx.fillStyle = stroke
  }

  const drawDot = (ctx: CanvasRenderingContext2D, p: Point) => {
    applyStyle(ctx)
    ctx.beginPath()
    ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawTo = (ctx: CanvasRenderingContext2D, p2: Point) => {
    const pts = points.current
    const p0 = pts[pts.length - 2]
    const p1 = pts[pts.length - 1]
    const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }
    const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
    applyStyle(ctx)
    ctx.beginPath()
    ctx.moveTo(mid1.x, mid1.y)
    ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y)
    ctx.stroke()
    pts.push(p2)
    if (pts.length > 3) pts.shift()
  }

  const placeStamp = (ctx: CanvasRenderingContext2D, p: Point) => {
    ctx.save()
    ctx.shadowBlur = 0
    ctx.translate(p.x, p.y)
    ctx.rotate((Math.random() - 0.5) * 0.5)
    ctx.font = `${size}px ${EMOJI_FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(stamp, 0, 0)
    ctx.restore()
  }

  const bucketFill = (ctx: CanvasRenderingContext2D, p: Point) => {
    const paint = ctx.getImageData(0, 0, WIDTH, HEIGHT)
    const outlineCtx = outlineRef.current?.getContext('2d', {
      willReadFrequently: true,
    })
    const outline = pageId
      ? (outlineCtx?.getImageData(0, 0, WIDTH, HEIGHT) ?? null)
      : null
    const changed = floodFill(paint, outline, p.x, p.y, hexToRgb(color))
    if (changed) ctx.putImageData(paint, 0, 0)
    return changed
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== null) return
    const ctx = paintCtx()
    if (!ctx) return
    const p = toCanvas(e)

    if (tool === 'bucket') {
      pushUndo()
      if (bucketFill(ctx, p)) {
        sounds.fill()
      } else {
        undoStack.current.pop()
        setCanUndo(undoStack.current.length > 0)
      }
      return
    }

    pushUndo()
    if (tool === 'stamp') {
      placeStamp(ctx, p)
      sounds.pop()
      return
    }

    activePointer.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    points.current = [p, p]
    drawDot(ctx, p)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== e.pointerId) return
    const ctx = paintCtx()
    if (!ctx) return
    const events = e.nativeEvent.getCoalescedEvents?.() ?? []
    const list = events.length ? events : [e.nativeEvent]
    for (const ev of list) drawTo(ctx, toCanvas(ev))
  }

  const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== e.pointerId) return
    activePointer.current = null
    points.current = []
  }

  // --- Pictures ----------------------------------------------------------

  const startPicture = (page: ColoringPage | null) => {
    const ctx = paintCtx()
    if (!ctx) return
    pushUndo()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    setPageId(page?.id ?? null)
    setPickerOpen(false)
    if (page) setTool('bucket')
    sounds.pop()
  }

  const savePicture = async () => {
    const paint = paintRef.current
    const outline = outlineRef.current
    if (!paint || !outline) return
    sounds.shutter()
    setFlashKey((k) => k + 1)

    const out = document.createElement('canvas')
    out.width = WIDTH
    out.height = HEIGHT
    const ctx = out.getContext('2d')!
    ctx.drawImage(paint, 0, 0)
    ctx.drawImage(outline, 0, 0)

    const blob = await new Promise<Blob | null>((resolve) =>
      out.toBlob(resolve, 'image/png'),
    )
    if (!blob) return
    const time = new Date()
      .toISOString()
      .slice(0, 16)
      .replace('T', '-')
      .replace(':', '')
    const fileName = `doodle-pop-${time}.png`
    const file = new File([blob], fileName, { type: 'image/png' })

    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'My Doodle Pop picture' })
        toast.success('Picture saved! 🎉')
      } catch (err) {
        if ((err as Error).name !== 'AbortError') download(blob, fileName)
      }
      return
    }
    download(blob, fileName)
  }

  const download = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
    toast.success('Picture saved! 🎉')
  }

  // --- UI ----------------------------------------------------------------

  const showColors = tool !== 'eraser' && tool !== 'stamp' && tool !== 'rainbow'

  return (
    <div className="flex h-dvh flex-col gap-3 overflow-hidden bg-background p-3 sm:p-4">
      <header className="flex items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <RoundButton
            label="Undo"
            onClick={undo}
            disabled={!canUndo}
            className="bg-card text-foreground"
          >
            <Undo2 className="size-7" strokeWidth={2.5} />
          </RoundButton>
          <RoundButton
            label="New picture"
            onClick={() => {
              sounds.tap()
              setPickerOpen(true)
            }}
            className="bg-card text-primary"
          >
            <ImagePlus className="size-7" strokeWidth={2.5} />
          </RoundButton>
          <button
            type="button"
            onClick={savePicture}
            aria-label="Save picture"
            className="flex h-16 items-center gap-2 rounded-full bg-accent px-6 text-xl font-bold text-accent-foreground shadow-[0_5px_0_oklch(0.55_0.17_25)] transition active:translate-y-1 active:shadow-[0_1px_0_oklch(0.55_0.17_25)]"
          >
            <Camera className="size-8" strokeWidth={2.5} />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 gap-3">
        <nav
          aria-label="Tools"
          className="flex flex-col justify-center gap-2 rounded-[2rem] bg-card p-2 shadow-sm"
        >
          {TOOLS.map((t) => {
            const Icon = t.icon
            const active = t.id === tool
            const tint =
              t.id === 'eraser'
                ? '#f472b6'
                : t.id === 'stamp'
                  ? '#f59e0b'
                  : t.id === 'rainbow'
                    ? '#8b5cf6'
                    : color === '#ffffff'
                      ? '#94a3b8'
                      : color
            return (
              <button
                key={t.id}
                type="button"
                aria-label={t.label}
                aria-pressed={active}
                onClick={() => {
                  sounds.tap()
                  setTool(t.id)
                }}
                className={cn(
                  'flex size-16 items-center justify-center rounded-3xl transition-all sm:size-[4.5rem]',
                  active
                    ? 'scale-105 bg-secondary shadow-inner ring-4 ring-primary/40'
                    : 'hover:bg-secondary/60',
                )}
              >
                {t.id === 'stamp' && active ? (
                  <span className="text-4xl leading-none">{stamp}</span>
                ) : (
                  <Icon
                    className="size-9"
                    strokeWidth={2.4}
                    style={{ color: tint }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        <div
          ref={areaRef}
          className="flex min-h-0 min-w-0 flex-1 items-center justify-center"
        >
          <div
            className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_8px_30px_-8px_oklch(0.4_0.08_280/0.35)] ring-4 ring-white"
            style={{ width: boardSize.width, height: boardSize.height }}
          >
            <canvas
              ref={paintRef}
              width={WIDTH}
              height={HEIGHT}
              aria-label="Drawing board"
              className={cn(
                'absolute inset-0 size-full touch-none',
                tool === 'stamp' || tool === 'bucket'
                  ? 'cursor-pointer'
                  : 'cursor-crosshair',
              )}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endStroke}
              onPointerCancel={endStroke}
              onContextMenu={(e) => e.preventDefault()}
            />
            <canvas
              ref={outlineRef}
              width={WIDTH}
              height={HEIGHT}
              aria-hidden
              className="pointer-events-none absolute inset-0 size-full"
            />
          </div>
        </div>
      </main>

      <footer className="flex min-h-[4.5rem] flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-[2rem] bg-card px-4 py-2 shadow-sm">
        {currentTool.sizes && (
          <div className="flex items-center gap-1" aria-label="Size">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={['Small', 'Medium', 'Large'][i]}
                aria-pressed={sizeIndex === i}
                onClick={() => {
                  sounds.tap()
                  setSizeIndex(i)
                }}
                className={cn(
                  'flex size-14 items-center justify-center rounded-2xl transition',
                  sizeIndex === i ? 'bg-secondary ring-4 ring-primary/40' : '',
                )}
              >
                <span
                  className="rounded-full bg-foreground"
                  style={{
                    width: [10, 20, 32][i],
                    height: [10, 20, 32][i],
                    background:
                      tool === 'eraser'
                        ? '#f9a8d4'
                        : tool === 'rainbow'
                          ? 'conic-gradient(#ef4444,#facc15,#22c55e,#3b82f6,#8b5cf6,#ef4444)'
                          : tool === 'stamp'
                            ? '#f59e0b'
                            : color === '#ffffff'
                              ? '#cbd5e1'
                              : color,
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {currentTool.sizes && (showColors || tool === 'stamp') && (
          <div className="hidden h-10 w-1 rounded-full bg-border sm:block" />
        )}

        {showColors && (
          <div
            className="flex flex-wrap items-center justify-center gap-2"
            aria-label="Colors"
          >
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                aria-pressed={color === c}
                onClick={() => {
                  sounds.tap()
                  setColor(c)
                }}
                className={cn(
                  'size-11 rounded-full border-4 transition-transform',
                  color === c
                    ? 'scale-125 border-white shadow-[0_0_0_3px_var(--primary)]'
                    : 'border-white shadow-[0_0_0_1px_var(--border)] active:scale-90',
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        )}

        {tool === 'stamp' && (
          <div
            className="flex flex-wrap items-center justify-center gap-1"
            aria-label="Stamps"
          >
            {STAMPS.map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`Stamp ${s}`}
                aria-pressed={stamp === s}
                onClick={() => {
                  sounds.tap()
                  setStamp(s)
                }}
                className={cn(
                  'flex size-14 items-center justify-center rounded-2xl text-4xl transition',
                  stamp === s
                    ? 'scale-110 bg-secondary ring-4 ring-primary/40'
                    : 'active:scale-90',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {tool === 'rainbow' && (
          <p className="text-lg font-semibold text-muted-foreground">
            🌈 Rainbow magic!
          </p>
        )}
      </footer>

      <PicturePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={startPicture}
      />

      {flashKey > 0 && (
        <div
          key={flashKey}
          className="animate-flash pointer-events-none fixed inset-0 z-50 bg-white"
        />
      )}
    </div>
  )
}

function RoundButton({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'flex size-16 items-center justify-center rounded-full shadow-[0_4px_0_var(--border)] transition active:translate-y-1 active:shadow-none disabled:opacity-35',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function Logo() {
  const letters = 'Doodle Pop'.split('')
  const palette = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
  return (
    <h1 className="flex items-baseline text-3xl font-bold tracking-tight sm:text-4xl">
      {letters.map((ch, i) =>
        ch === ' ' ? (
          <span key={i} className="w-2" />
        ) : (
          <span
            key={i}
            style={{
              color: palette[i % palette.length],
              display: 'inline-block',
              transform: `rotate(${i % 2 ? 4 : -4}deg)`,
            }}
          >
            {ch}
          </span>
        ),
      )}
    </h1>
  )
}
