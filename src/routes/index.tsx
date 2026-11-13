import { createFileRoute } from '@tanstack/react-router'

import { DrawingBoard } from '@/components/drawing-board'

export const Route = createFileRoute('/')({
  component: DrawingBoard,
})
