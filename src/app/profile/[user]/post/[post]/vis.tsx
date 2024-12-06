'use client'

import { AtProtoThreadResponse, getPost, getPostByAtUri } from '@/bsky'
import { LayoutNode, Tree } from '@/post'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import TreeVisualization from './tree'
import Sidebar from './sidebar'

export default function Vis({ user, post }: { user: string; post: string }) {
  const [postState, setPostState] = useState<LayoutNode[]>([])
  const [selected, setSelected] = useState<LayoutNode | null>(null)
  const treeRef = useRef<Tree | null>(null)

  useEffect(() => {
    getPost(user, post).then((threadResponse: AtProtoThreadResponse) => {
      treeRef.current = new Tree(threadResponse.thread)
      const postState = treeRef.current.root.getChildren()
      setPostState(postState)
      setSelected(postState[0])
    })
  }, [user, post])

  const onExpandNode = useCallback((node: LayoutNode) => {
    if (node.post.hasMoreChildren()) {
      getPostByAtUri(node.post.post.uri).then((threadResponse: AtProtoThreadResponse) => {
        if (!treeRef.current) {
          return
        }
        treeRef.current.addReplies(node.post, threadResponse.thread)
        const postState = treeRef.current.root.getChildren()
        setPostState(postState)
      })
    }
  }, [])

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="flex-1">
        <TreeVisualization
          postState={postState}
          onSetSelected={setSelected}
          onExpandNode={onExpandNode}
        />
      </div>
      <div className="h-96 md:h-full md:w-96">
        <Sidebar selected={selected} />
      </div>
    </div>
  )
}
