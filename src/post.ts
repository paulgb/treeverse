import { AtProtoPost, AtProtoThread } from './bsky'

export class Tree {
  root: Post
  map: Map<string, Post>

  constructor(thread: AtProtoThread) {
    this.map = new Map<string, Post>()
    this.root = this.addReplies(null, thread)
  }

  addReplies(parent: Post | null, thread: AtProtoThread): Post {
    let post = this.map.get(thread.post.uri)
    if (!post) {
      post = new Post(parent, thread.post)
      this.map.set(thread.post.uri, post)
    }

    console.log('thread', thread)
    for (const reply of thread.replies ?? []) {
      this.addReplies(post, reply)
      post.children.push(this.map.get(reply.post.uri)!)
    }

    post.width = Math.max(
      1,
      post.children.reduce((sum, child) => sum + child.width, 0),
    )
    post.height = post.children.reduce((sum, child) => Math.max(sum, child.height), 0) + 1

    return post
  }
}

export interface LayoutNode {
  x: number
  y: number
  parent: LayoutNode | null
  post: Post
}

export class Post {
  children: Post[]
  width: number
  /** Maximum number of descendants in the longest known path from this node. */
  height: number

  constructor(
    private parent: Post | null,
    public post: AtProtoPost,
  ) {
    this.children = []
    this.width = 1
    this.height = 1
  }

  hasMoreChildren() {
    return this.children.length < this.post.replyCount
  }

  private getChildrenInner(
    xOffset: number,
    yOffset: number,
    parent: LayoutNode | null,
  ): LayoutNode[] {
    const nodes: LayoutNode[] = []
    const thisNode: LayoutNode = {
      x: xOffset + this.width / 2,
      y: yOffset,
      parent,
      post: this,
    }
    nodes.push(thisNode)

    for (const child of this.children) {
      nodes.push(...child.getChildrenInner(xOffset, yOffset + 1, thisNode))
      xOffset += child.width
    }

    return nodes
  }

  getChildren(): LayoutNode[] {
    return this.getChildrenInner(0, 0, null)
  }
}
