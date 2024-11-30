import { useCallback, useRef, useState } from 'react'

interface ZoomState {
  offset: { x: number; y: number }
  scale: number
  target: { width: number; height: number }
}

export function useZoomState() {
  const innerState = useRef<ZoomState>({
    offset: { x: 0, y: 0 },
    scale: 1,
    target: { width: 0, height: 0 },
  })
  const [transform, setTransform] = useState('')

  const updateTransform = useCallback(() => {
    setTransform(
      `translate(${innerState.current.offset.x}, ${innerState.current.offset.y}) scale(${innerState.current.scale})`,
    )
  }, [])

  const setTarget = useCallback(
    (target: { width: number; height: number }) => {
      innerState.current.target = target
      updateTransform()
    },
    [updateTransform],
  )

  const setBounds = useCallback(
    (bounds: { top: number; left: number; bottom: number; right: number }) => {
      const width = bounds.right - bounds.left
      const height = bounds.bottom - bounds.top
      let xScale = innerState.current.target.width / width
      let yScale = innerState.current.target.height / height

      if (xScale < yScale) {
        innerState.current.scale = xScale
        innerState.current.offset.x = -bounds.left * xScale
        innerState.current.offset.y =
          -bounds.top + (innerState.current.target.height - height * xScale) / 2
      } else {
        innerState.current.scale = yScale
        innerState.current.offset.x =
          -bounds.left + (innerState.current.target.width - width * yScale) / 2
        innerState.current.offset.y = -bounds.top * yScale
      }

      updateTransform()
    },
    [updateTransform],
  )

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault()
      event.stopPropagation()
      
      const { deltaY, clientX, clientY } = event

      const oldScale = innerState.current.scale
      innerState.current.scale *= 1 - deltaY / 100
      const scaleDelta = innerState.current.scale / oldScale
      innerState.current.offset.x -= (clientX - innerState.current.offset.x) * (scaleDelta - 1)
      innerState.current.offset.y -= (clientY - innerState.current.offset.y) * (scaleDelta - 1)

      updateTransform()
    },
    [updateTransform],
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (event.buttons === 1) {
        innerState.current.offset.x += event.movementX
        innerState.current.offset.y += event.movementY
        updateTransform()
      }
    },
    [updateTransform],
  )

  return {
    transform,
    handleWheel,
    handleMouseMove,
    setBounds,
    setTarget,
  }
}
