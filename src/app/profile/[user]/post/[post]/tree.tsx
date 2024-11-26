import { LayoutNode } from '@/post'
import { useZoomState } from '@/zoom'
import React, { memo, useCallback, useEffect } from 'react'

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
  setSelected,
}: {
  postState: LayoutNode[]
  setSelected: (node: LayoutNode) => void
}) {
  return (
    <>
      <g>
        {postState.map((node) => (
          <React.Fragment key={node.treeNode.post.uri}>
            {node.parent && <path d={smoothPath(node.parent, node)} stroke="#aaa" fill="none" />}
          </React.Fragment>
        ))}
      </g>
      <g>
        {postState.map((node) => (
          <g
            key={node.treeNode.post.uri}
            transform={`translate(${node.x * UNIT}, ${node.y * UNIT})`}
            onClick={() => setSelected(node)}
          >
            <rect x={-DIM / 2} y={-DIM / 2} width={DIM} height={DIM} fill="white" />
            <image
              href={node.treeNode.post.author.avatar}
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
          </g>
        ))}
      </g>
    </>
  )
})

export default function TreeVisualization({
  postState,
  setSelected,
}: {
  postState: LayoutNode[]
  setSelected: (node: LayoutNode) => void
}) {
  const zoomState = useZoomState({
    offset: { x: 0, y: 0 },
    scale: 1,
    target: { width: 0, height: 0 },
  })

  useEffect(() => {
    let maxX = 0
    let maxY = 0
    for (const node of postState) {
      maxX = Math.max(maxX, node.x * UNIT)
      maxY = Math.max(maxY, node.y * UNIT)
    }
    zoomState.setBounds({
      top: -UNIT,
      left: -UNIT,
      right: maxX + UNIT,
      bottom: maxY + UNIT,
    })
  }, [postState])

  const svgRef = useCallback(
    (el: SVGSVGElement) => {
      if (el) {
        zoomState.setTarget({ width: el.clientWidth, height: el.clientHeight })
      }
    },
    [zoomState.setTarget],
  )
  return (
    <svg
      className="w-full h-full"
      onWheel={zoomState.handleWheel}
      onMouseMove={zoomState.handleMouseMove}
      ref={svgRef}
    >
      <g transform={zoomState.transform}>
        <TreeVisualizationInner postState={postState} setSelected={setSelected} />
      </g>
    </svg>
  )
}
