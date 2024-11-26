'use client'

import { AtProtoThreadResponse, getPosts } from '@/bsky'
import { LayoutNode, Tree } from '@/post'
import React, { useEffect, useState } from 'react'
import TreeVisualization from './tree'
import Sidebar from './sidebar'

export default function Vis({ user, post }: { user: string; post: string }) {
  const [postState, setPostState] = useState<LayoutNode[]>([])
  const [selected, setSelected] = useState<LayoutNode | null>(null)

  useEffect(() => {
    getPosts(user, post).then((threadResponse: AtProtoThreadResponse) => {
      const tree = new Tree(threadResponse.thread)
      const postState = tree.root.getChildren()
      setPostState(postState)
      setSelected(postState[0])
    })
  }, [user, post])

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <TreeVisualization postState={postState} setSelected={setSelected} />
      </div>
      <div className="w-96">
        <Sidebar selected={selected} />
      </div>
    </div>
  )
}
