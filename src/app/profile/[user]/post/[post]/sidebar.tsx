import { AtProtoPost } from '@/bsky'
import { LayoutNode } from '@/post'

function Post({ post }: { post: AtProtoPost }) {
  return (
    <div className="p-2 border border-gray-700 rounded-md space-y-4">
      <div className="flex items-center gap-2">
        <img src={post.author.avatar} className="w-10 h-10 rounded-full" />
        <div>
          <div className="text-base font-bold text-gray-300">{post.author.displayName}</div>
          <div className="text-sm text-gray-500">{post.author.handle}</div>
        </div>
      </div>
      <div className="text-sm text-gray-200">{post.record.text}</div>
    </div>
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
  if (!selected) {
    return null
  }

  const thread = collectThread(selected)

  return (
    <div className="flex flex-col gap-2 p-2">
      {thread.map((post, i) => (
        <Post post={post} key={i} />
      ))}
    </div>
  )
}
