import { useCallback, useRef, useState } from 'react'

export function useZoomState() {
  const innerState = useRef({ offset: { x: 0, y: 0 }, scale: 1 })
  const [transform, setTransform] = useState(`translate(0, 0) scale(1)`)

  const updateTransform = useCallback(() => {
    setTransform(
      `translate(${innerState.current.offset.x}, ${innerState.current.offset.y}) scale(${innerState.current.scale})`,
    )
  }, [])

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
  }
}
