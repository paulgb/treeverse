import { useCallback, useEffect, useRef, useState } from 'react'

interface ZoomState {
  position: {
    offset: { x: number; y: number }
    scale: number
  } | null
  target: { width: number; height: number }
}

interface TouchState {
  touchCount: number
  lastTouchDistance: number | null
  lastTouchCenter: { x: number; y: number } | null
}

export function useZoomState() {
  const innerState = useRef<ZoomState>({
    position: null,
    target: { width: 0, height: 0 },
  })
  const animationFrame = useRef<number | null>(null)
  const [transform, setTransform] = useState('')
  const touchState = useRef<TouchState>({
    touchCount: 0,
    lastTouchDistance: null,
    lastTouchCenter: null,
  })

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

  const handleTouchStart = useCallback((event: React.TouchEvent<SVGSVGElement>) => {
    event.preventDefault()
    touchState.current.touchCount = event.touches.length

    if (event.touches.length === 2) {
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      touchState.current.lastTouchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      )
      touchState.current.lastTouchCenter = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      }
    }
  }, [])

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<SVGSVGElement>) => {
      event.preventDefault()
      if (!innerState.current.position) return

      if (event.touches.length === 1) {
        // Single touch - pan
        const touch = event.touches[0]
        const prevTouch = event.changedTouches[0]
        const movementX = touch.clientX - prevTouch.clientX
        const movementY = touch.clientY - prevTouch.clientY

        innerState.current.position.offset.x += movementX
        innerState.current.position.offset.y += movementY
      } else if (event.touches.length === 2) {
        // Pinch to zoom
        const touch1 = event.touches[0]
        const touch2 = event.touches[1]
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        )
        const currentCenter = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
        }

        if (touchState.current.lastTouchDistance && touchState.current.lastTouchCenter) {
          const scale = currentDistance / touchState.current.lastTouchDistance
          const oldScale = innerState.current.position.scale
          innerState.current.position.scale *= scale

          // Adjust offset to zoom around the center point of the pinch
          const scaleDelta = innerState.current.position.scale / oldScale
          innerState.current.position.offset.x -=
            (currentCenter.x - innerState.current.position.offset.x) * (scaleDelta - 1)
          innerState.current.position.offset.y -=
            (currentCenter.y - innerState.current.position.offset.y) * (scaleDelta - 1)
        }

        touchState.current.lastTouchDistance = currentDistance
        touchState.current.lastTouchCenter = currentCenter
      }

      if (!animationFrame.current) {
        animationFrame.current = requestAnimationFrame(updateTransform)
      }
    },
    [updateTransform],
  )

  const handleTouchEnd = useCallback((event: React.TouchEvent<SVGSVGElement>) => {
    event.preventDefault()
    touchState.current.touchCount = event.touches.length
    if (event.touches.length < 2) {
      touchState.current.lastTouchDistance = null
      touchState.current.lastTouchCenter = null
    }
  }, [])

  return {
    transform,
    handleWheel,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setBounds,
    setTarget,
  }
}
