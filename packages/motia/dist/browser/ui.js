import { useState as n, useEffect as p } from "react";
function E() {
  const [t, s] = n([]), [r, b] = n([]), [f, a] = n(!0), [l, w] = n(null);
  return p(() => {
    async function u() {
      var c;
      try {
        const o = await fetch("/api/workflows");
        if (!o.ok)
          throw new Error(`Failed to fetch workflows: ${o.statusText}`);
        const i = (c = (await o.json()).workflows) == null ? void 0 : c[0];
        if (!i)
          throw new Error("No workflows found");
        const h = i.components.map((e, m) => ({
          id: e.id,
          type: e.id,
          position: { x: m * 200, y: 100 },
          data: { label: e.id, subscribe: e.subscribe }
        }));
        s(h), a(!1);
      } catch (o) {
        w(o.message), a(!1);
      }
    }
    u();
  }, []), { nodes: t, edges: r, loading: f, error: l };
}
const d = /* @__PURE__ */ Object.assign({}), k = {};
for (const t in d) {
  const s = t.match(/components\/([^/]+)\/ui\.jsx$/);
  if (s) {
    const r = s[1];
    k[r] = d[t].default;
  }
}
export {
  k as nodeTypes,
  E as useMotiaFlow
};
