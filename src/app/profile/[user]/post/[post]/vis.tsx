'use client'

import { AtProtoThreadResponse, getPosts } from '@/bsky'
import { LayoutNode, Tree } from '@/post'
import { useZoomState } from '@/zoom'
import React, { memo, useEffect, useState } from 'react'

const DIM = 40
const XD = 1400
const YD = 700

function smoothPath(point1: { x: number; y: number }, point2: { x: number; y: number }) {
  const startX = XD * point1.x
  const startY = YD * point1.y
  const endX = XD * point2.x
  const endY = YD * point2.y
  return `M${startX},${startY} C${startX},${startY} ${endX},${startY} ${endX},${endY}`
}

const TreeVisualization = memo(function TreeVisualization({
  postState,
}: {
  postState: LayoutNode[]
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
          <g key={node.treeNode.post.uri} transform={`translate(${node.x * XD}, ${node.y * YD})`}>
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

export default function Vis({ user, post }: { user: string; post: string }) {
  const [postState, setPostState] = useState<LayoutNode[]>([])
  const zoomState = useZoomState()

  useEffect(() => {
    getPosts(user, post).then((threadResponse: AtProtoThreadResponse) => {
      const tree = new Tree(threadResponse.thread)
      setPostState(tree.root.getChildren())
    })
  }, [user, post])

  return (
    <div className="w-full h-full">
      <svg
        className="w-full h-full"
        onWheel={zoomState.handleWheel}
        onMouseMove={zoomState.handleMouseMove}
      >
        <g transform={zoomState.transform}>
          <TreeVisualization postState={postState} />
        </g>
      </svg>
    </div>
  )
}
