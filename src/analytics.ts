// Lazy-loaded Mixpanel wrapper. mixpanel-browser is ~130KB gzipped, big
// enough to hurt first paint if shipped in the critical bundle, so we load
// it via dynamic import() into its own chunk after first paint.
//
// Token is the shared write-only client token for the drewhoover.com
// data-viz sites project. Safe to commit.
const TOKEN = '1c6a0f45b8a5768185a8d9a2f4d65452'

type Props = Record<string, unknown>

// Kept loosely typed: @types/mixpanel-browser doesn't model the
// track_pageview config string, and analytics must never break the app.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mp: any = null
const queue: [string, Props | undefined][] = []

function flush(): void {
  if (!mp) return
  for (const [name, props] of queue) {
    try { mp.track(name, props) } catch { /* noop */ }
  }
  queue.length = 0
}

if (typeof window !== 'undefined') {
  import('mixpanel-browser')
    .then((m) => {
      mp = m.default
      mp.init(TOKEN, {
        // Auto-fire pageviews on initial load and on every history API
        // change (replaceState included), so each axis/filter URL update
        // counts as its own pageview.
        track_pageview: 'url-with-path-and-query-string',
      })
      flush()
    })
    .catch(() => {
      // Adblockers commonly block any script with 'mixpanel' in the URL.
      // Drop queued events silently — analytics failure must not break us.
      queue.length = 0
    })
}

export function track(name: string, props?: Props): void {
  if (mp) {
    try { mp.track(name, props) } catch { /* noop */ }
  } else {
    queue.push([name, props])
  }
}
