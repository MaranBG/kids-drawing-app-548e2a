/**
 * Scanline flood fill. Reads colors from the paint layer and treats any opaque
 * pixel in the outline layer as a wall, then writes the fill color back into
 * the paint layer only. The fill is grown a couple of pixels under the outlines
 * so no white halo is left along anti-aliased edges.
 */
export function floodFill(
  paint: ImageData,
  outline: ImageData | null,
  startX: number,
  startY: number,
  fill: [number, number, number],
  tolerance = 48,
) {
  const { width, height, data } = paint
  const walls = outline?.data
  const x0 = Math.floor(startX)
  const y0 = Math.floor(startY)
  if (x0 < 0 || y0 < 0 || x0 >= width || y0 >= height) return false

  const startIdx = (y0 * width + x0) * 4
  if (walls && walls[startIdx + 3] > 100) return false

  const tr = data[startIdx]
  const tg = data[startIdx + 1]
  const tb = data[startIdx + 2]
  if (
    Math.abs(tr - fill[0]) < 4 &&
    Math.abs(tg - fill[1]) < 4 &&
    Math.abs(tb - fill[2]) < 4
  ) {
    return false
  }

  const filled = new Uint8Array(width * height)

  const matches = (p: number) => {
    if (filled[p]) return false
    const i = p * 4
    if (walls && walls[i + 3] > 100) return false
    return (
      Math.abs(data[i] - tr) <= tolerance &&
      Math.abs(data[i + 1] - tg) <= tolerance &&
      Math.abs(data[i + 2] - tb) <= tolerance
    )
  }

  const stack: Array<number> = [x0, y0]
  while (stack.length) {
    const y = stack.pop()!
    let x = stack.pop()!
    let p = y * width + x
    while (x > 0 && matches(p - 1)) {
      x--
      p--
    }
    let spanUp = false
    let spanDown = false
    while (x < width && matches(p)) {
      filled[p] = 1
      if (y > 0) {
        const up = matches(p - width)
        if (up && !spanUp) {
          stack.push(x, y - 1)
          spanUp = true
        } else if (!up) spanUp = false
      }
      if (y < height - 1) {
        const down = matches(p + width)
        if (down && !spanDown) {
          stack.push(x, y + 1)
          spanDown = true
        } else if (!down) spanDown = false
      }
      x++
      p++
    }
  }

  // Grow the fill by a few pixels so edges look crisp (under outlines and over
  // anti-aliased stroke edges).
  const grow = 2
  const mask = filled.slice()
  for (let pass = 0; pass < grow; pass++) {
    const src = pass === 0 ? filled : mask.slice()
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const p = y * width + x
        if (src[p]) continue
        if (!(src[p - 1] || src[p + 1] || src[p - width] || src[p + width])) {
          continue
        }
        const i = p * 4
        const underOutline = walls ? walls[i + 3] > 0 : false
        const softEdge =
          Math.abs(data[i] - tr) <= tolerance * 3 &&
          Math.abs(data[i + 1] - tg) <= tolerance * 3 &&
          Math.abs(data[i + 2] - tb) <= tolerance * 3
        if (underOutline || softEdge) mask[p] = 1
      }
    }
  }

  for (let p = 0; p < mask.length; p++) {
    if (!mask[p]) continue
    const i = p * 4
    data[i] = fill[0]
    data[i + 1] = fill[1]
    data[i + 2] = fill[2]
    data[i + 3] = 255
  }
  return true
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
