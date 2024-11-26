import Urlbar from "./urlbar";

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-300 leading-loose">{children}</p>;
}

function Samp({ children }: { children: React.ReactNode }) {
  return (
    <samp className="text-gray-400 font-mono bg-gray-800 p-1 rounded">
      {children}
    </samp>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-blue-300 hover:text-blue-400">
      {children}
    </a>
  );
}

export default function Home() {
  return (
    <div className="max-w-screen-lg mx-auto p-3">
      <h1 className="text-2xl font-bold leading-loose">Treeverse</h1>
      <P>Treeverse is a tool for visualizing threaded Bluesky conversations.</P>
      <P>
        Paste a <A href="https://bsky.social">Bluesky</A> post URL or an{" "}
        <Samp>at://</Samp> URL below to visualize a thread.
      </P>
      <div className="my-5">
        <Urlbar />
      </div>
      <P>
        Created by{" "}
        <A href="https://bsky.app/profile/paulbutler.org">Paul Butler</A>.{" "}
        Source code is available on{" "}
        <A href="https://github.com/paulgb/treeverse">GitHub</A>.
      </P>
    </div>
  );
}
