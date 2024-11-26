import { AtProtoPost, AtProtoThread } from './bsky'

export class Tree {
  root: Post
  map: Map<string, Post>

  constructor(thread: AtProtoThread) {
    this.root = new Post(null, 0, thread)
    this.map = new Map<string, Post>()
  }
}

export interface LayoutNode {
  x: number
  y: number
  parent: LayoutNode | null
  treeNode: Post
}

export class Post {
  children: Post[]
  width: number
  /** Maximum number of descendants in the longest known path from this node. */
  height: number
  post: AtProtoPost

  constructor(
    private parent: Post | null,
    private depth: number,
    thread: AtProtoThread,
  ) {
    this.post = thread.post
    this.children = (thread.replies ?? []).map((reply) => new Post(this, depth + 1, reply))
    this.width = Math.max(
      1,
      this.children.reduce((sum, child) => sum + child.width, 0),
    )
    this.height = this.children.reduce((acc, child) => Math.max(acc, child.height), 0) + 1
  }

  private getChildrenInner(
    xOffset: number,
    yOffset: number,
    xSize: number,
    ySize: number,
    parent: LayoutNode | null,
  ): LayoutNode[] {
    const nodes: LayoutNode[] = []
    const thisNode: LayoutNode = {
      x: (xOffset + this.width / 2) * xSize,
      y: yOffset * ySize + ySize / 2,
      parent,
      treeNode: this,
    }
    nodes.push(thisNode)

    for (const child of this.children) {
      nodes.push(...child.getChildrenInner(xOffset, yOffset + 1, xSize, ySize, thisNode))
      xOffset += child.width
    }

    return nodes
  }

  getChildren(): LayoutNode[] {
    return this.getChildrenInner(0, 0, 1 / this.width, 1 / this.height, null)
  }
}
