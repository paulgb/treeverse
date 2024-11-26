import { AtProtoPost } from '@/bsky'
import { LayoutNode } from '@/post'
import { useEffect, useRef } from 'react'

function urlFromPost(post: AtProtoPost): string | null {
  const match = post.uri.match(/^at:\/\/([^\/]+)\/app\.bsky\.feed\.post\/([a-z0-9]+)$/)
  if (!match) {
    return null
  }

  const [_, did, postId] = match
  return `https://bsky.app/profile/${did}/post/${postId}`
}

function Post({ post }: { post: AtProtoPost }) {
  return (
    <a
      href={urlFromPost(post) ?? '#'}
      target="_blank"
      className="block p-2 border border-gray-700 rounded-md space-y-4 hover:bg-gray-800"
    >
      <div className="flex items-center gap-2">
        <img src={post.author.avatar} className="w-10 h-10 rounded-full" />
        <div>
          <div className="text-base font-bold text-gray-300">{post.author.displayName}</div>
          <div className="text-sm text-gray-500">@{post.author.handle}</div>
        </div>
      </div>
      <div className="text-sm text-gray-200">{post.record.text}</div>
    </a>
  )
}

function collectThread(node: LayoutNode | null): AtProtoPost[] {
  let thread: AtProtoPost[] = []
  while (node) {
    thread.push(node.treeNode.post)
    node = node.parent
  }
  return thread.reverse()
}

export default function Sidebar({ selected }: { selected: LayoutNode | null }) {
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sidebarRef.current) {
      // scroll to the bottom
      sidebarRef.current.scrollTop = sidebarRef.current.scrollHeight
    }
  }, [selected])

  if (!selected) {
    return null
  }

  const thread = collectThread(selected)

  return (
    <div className="flex flex-col gap-2 p-2 overflow-y-auto h-full" ref={sidebarRef}>
      {thread.map((post, i) => (
        <Post post={post} key={i} />
      ))}
    </div>
  )
}
