import { LayoutNode } from '@/post'
import { useZoomState } from '@/zoom'
import React, { memo, useCallback, useEffect, useRef } from 'react'

const DIM = 40
const UNIT = 120

function smoothPath(point1: { x: number; y: number }, point2: { x: number; y: number }) {
  const startX = UNIT * point1.x
  const startY = UNIT * point1.y
  const endX = UNIT * point2.x
  const endY = UNIT * point2.y
  return `M${startX},${startY} C${startX},${startY} ${endX},${startY} ${endX},${endY}`
}

const TreeVisualizationInner = memo(function TreeVisualization({
  postState,
  onSetSelected,
  onExpandNode,
}: {
  postState: LayoutNode[]
  onSetSelected: (node: LayoutNode) => void
  onExpandNode: (node: LayoutNode) => void
}) {
  const touchTimeout = useRef<NodeJS.Timeout | null>(null)
  const lastTouchTime = useRef<number>(0)

  const handleTouchStart = useCallback(
    (node: LayoutNode, event: React.TouchEvent) => {
      event.preventDefault()
      const now = Date.now()
      const timeSinceLastTouch = now - lastTouchTime.current

      if (timeSinceLastTouch < 300) {
        // Double tap detected
        if (touchTimeout.current) {
          clearTimeout(touchTimeout.current)
          touchTimeout.current = null
        }
        onExpandNode(node)
      } else {
        // Single tap - wait to see if it's a double tap
        touchTimeout.current = setTimeout(() => {
          onSetSelected(node)
          touchTimeout.current = null
        }, 300)
      }

      lastTouchTime.current = now
    },
    [onSetSelected, onExpandNode],
  )

  useEffect(() => {
    return () => {
      if (touchTimeout.current) {
        clearTimeout(touchTimeout.current)
      }
    }
  }, [])

  return (
    <>
      <g>
        {postState.map((node) => (
          <React.Fragment key={node.post.post.uri}>
            {node.parent && (
              <path
                stroke="#aaa"
                fill="none"
                style={
                  {
                    d: `path("${smoothPath(node.parent, node)}")`,
                    transition: '0.3s',
                  } as any
                }
              />
            )}
          </React.Fragment>
        ))}
      </g>
      <g>
        {postState.map((node) => (
          <g
            key={node.post.post.uri}
            transform={`translate(${node.x * UNIT}, ${node.y * UNIT})`}
            className="transition-transform duration-300 ease-out"
            onMouseOver={() => onSetSelected(node)}
            onDoubleClick={() => onExpandNode(node)}
            onTouchStart={(e) => handleTouchStart(node, e)}
          >
            <rect x={-DIM / 2} y={-DIM / 2} width={DIM} height={DIM} fill="white" />
            <image
              href={node.post.post.author.avatar}
              x={-DIM / 2}
              y={-DIM / 2}
              width={DIM}
              height={DIM}
            />
            <rect
              x={-DIM / 2}
              y={-DIM / 2}
              width={DIM}
              height={DIM}
              fill="none"
              stroke="#ddd"
              strokeWidth={3}
              rx={3}
              ry={3}
            />
            {node.post.hasMoreChildren() && (
              <g transform={`translate(${DIM / 2}, ${DIM / 2})`}>
                <circle r={8} fill="#22bb33" stroke="white" />
                <path
                  d="M -3 0 L 3 0 M 0 -3 L 0 3"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </g>
            )}
          </g>
        ))}
      </g>
    </>
  )
})

export default function TreeVisualization({
  postState,
  onSetSelected,
  onExpandNode,
}: {
  postState: LayoutNode[]
  onSetSelected: (node: LayoutNode) => void
  onExpandNode: (node: LayoutNode) => void
}) {
  const zoomState = useZoomState()
  const initialized = useRef(false)

  useEffect(() => {
    let maxX = 0
    let maxY = 0
    for (const node of postState) {
      maxX = Math.max(maxX, node.x * UNIT)
      maxY = Math.max(maxY, node.y * UNIT)
    }

    if (!initialized.current && postState.length > 0) {
      zoomState.setBounds({
        top: -UNIT,
        left: -UNIT,
        right: maxX + UNIT,
        bottom: maxY + UNIT,
      })

      initialized.current = true
    }
  }, [postState])

  const svgRef = useCallback(
    (el: SVGSVGElement) => {
      if (el) {
        zoomState.setTarget({ width: el.clientWidth, height: el.clientHeight })

        // We set this here rather than using onScroll, because we need a passive
        // event listener in order to prevent the page from scrolling.
        el.addEventListener('wheel', (event) => {
          zoomState.handleWheel(event as WheelEvent)
        })
      }
    },
    [zoomState.setTarget],
  )

  return (
    <svg
      className="w-full h-full select-none"
      onMouseMove={zoomState.handleMouseMove}
      onTouchStart={zoomState.handleTouchStart}
      onTouchMove={zoomState.handleTouchMove}
      onTouchEnd={zoomState.handleTouchEnd}
      ref={svgRef}
    >
      {zoomState.transform && (
        <g transform={zoomState.transform}>
          <TreeVisualizationInner
            postState={postState}
            onSetSelected={onSetSelected}
            onExpandNode={onExpandNode}
          />
        </g>
      )}
    </svg>
  )
}
