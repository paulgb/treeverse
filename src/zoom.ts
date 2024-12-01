import { useCallback, useEffect, useRef, useState } from 'react'

interface ZoomState {
  position: {
    offset: { x: number; y: number }
    scale: number
  } | null
  target: { width: number; height: number }
}

export function useZoomState() {
  const innerState = useRef<ZoomState>({
    position: null,
    target: { width: 0, height: 0 },
  })
  const animationFrame = useRef<number | null>(null)
  const [transform, setTransform] = useState('')

  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [])

  const updateTransform = () => {
    animationFrame.current = null

    console.log('updateTransform', innerState.current)
    if (!innerState.current.position) {
      return
    }
    console.log('updateTransform', innerState.current)
    setTransform(
      `translate(${innerState.current.position.offset.x}, ${innerState.current.position.offset.y}) scale(${innerState.current.position.scale})`,
    )
  }

  const setTarget = useCallback(
    (target: { width: number; height: number }) => {
      innerState.current.target = target
      if (!animationFrame.current) {
        animationFrame.current = requestAnimationFrame(updateTransform)
      }
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
        innerState.current.position = {
          offset: {
            x: -bounds.left * xScale,
            y: -bounds.top + (innerState.current.target.height - height * xScale) / 2,
          },
          scale: xScale,
        }
      } else {
        innerState.current.position = {
          offset: {
            x: -bounds.left + (innerState.current.target.width - width * yScale) / 2,
            y: -bounds.top * yScale,
          },
          scale: yScale,
        }
      }

      if (!animationFrame.current) {
        animationFrame.current = requestAnimationFrame(updateTransform)
      }
    },
    [updateTransform],
  )

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault()
      event.stopPropagation()

      const { deltaY, clientX, clientY } = event

      if (innerState.current.position === null) {
        return
      }

      const oldScale = innerState.current.position.scale
      innerState.current.position.scale *= 1 - deltaY / 10_000
      const scaleDelta = innerState.current.position.scale / oldScale
      innerState.current.position.offset.x -=
        (clientX - innerState.current.position.offset.x) * (scaleDelta - 1)
      innerState.current.position.offset.y -=
        (clientY - innerState.current.position.offset.y) * (scaleDelta - 1)

      if (!animationFrame.current) {
        animationFrame.current = requestAnimationFrame(updateTransform)
      }
    },
    [updateTransform],
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (event.buttons === 1) {
        if (!innerState.current.position) {
          return
        }

        innerState.current.position.offset.x += event.movementX
        innerState.current.position.offset.y += event.movementY

        if (!animationFrame.current) {
          animationFrame.current = requestAnimationFrame(updateTransform)
        }
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
