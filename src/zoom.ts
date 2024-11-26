import { useCallback, useRef, useState } from 'react'

export function useZoomState(initial: { offset: { x: number; y: number }; scale: number }) {
  const innerState = useRef(initial)
  const [transform, setTransform] = useState(`translate(0, 0) scale(1)`)

  const updateTransform = useCallback(() => {
    setTransform(
      `translate(${innerState.current.offset.x}, ${innerState.current.offset.y}) scale(${innerState.current.scale})`,
    )
  }, [])

  const setBounds = useCallback(
    (bounds: { top: number; left: number; bottom: number; right: number }) => {
      const width = bounds.right - bounds.left
      const height = bounds.bottom - bounds.top
      let xScale = window.innerWidth / width
      let yScale = window.innerHeight / height

      if (xScale < yScale) {
        console.log('xScale < yScale')
        innerState.current.scale = xScale
        innerState.current.offset.x = -bounds.left * xScale
        innerState.current.offset.y = -bounds.top + (window.innerHeight - height * xScale) / 2
      } else {
        console.log('yScale < xScale')
        innerState.current.scale = yScale
        innerState.current.offset.x = -bounds.left + (window.innerWidth - width * yScale) / 2
        innerState.current.offset.y = -bounds.top * yScale
      }

      // innerState.current.scale = Math.min(xScale, yScale)
      updateTransform()
    },
    [updateTransform],
  )

  const handleWheel = useCallback(
    (event: React.WheelEvent<SVGSVGElement>) => {
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
  }
}
