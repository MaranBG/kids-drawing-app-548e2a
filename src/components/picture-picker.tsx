import { useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  coloringPages,
  drawColoringPage,
  type ColoringPage,
} from '@/drawing/coloring-pages'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (page: ColoringPage | null) => void
}

export function PicturePicker({ open, onOpenChange, onPick }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-[2rem] border-0 p-6 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold">
            Pick a new picture!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Start fresh, or choose one to color in.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          <PickerCard label="Blank" onClick={() => onPick(null)}>
            <div className="flex size-full items-center justify-center bg-white">
              <Sparkles className="size-12 text-primary" strokeWidth={2.2} />
            </div>
          </PickerCard>
          {coloringPages.map((page) => (
            <PickerCard
              key={page.id}
              label={page.name}
              onClick={() => onPick(page)}
            >
              <Thumbnail page={page} />
            </PickerCard>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PickerCard({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="animate-pop-in group flex flex-col items-center gap-2 rounded-3xl bg-secondary p-2 pb-3 transition active:scale-95"
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl ring-2 ring-border transition group-hover:ring-4 group-hover:ring-primary/50">
        {children}
      </div>
      <span className="text-lg font-semibold">{label}</span>
    </button>
  )
}

function Thumbnail({ page }: { page: ColoringPage }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 320, 240)
    drawColoringPage(ctx, page, 320, 240, 12)
  }, [page])
  return (
    <canvas
      ref={ref}
      width={320}
      height={240}
      className="size-full"
      aria-hidden
    />
  )
}
