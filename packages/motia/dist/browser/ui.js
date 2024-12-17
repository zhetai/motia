import { useState as r, useEffect as p } from "react";
function E() {
  const [s, t] = r([]), [e, k] = r([]), [l, c] = r(!0), [f, w] = r(null);
  return p(() => {
    async function u() {
      var i;
      try {
        const o = await fetch("/api/workflows");
        if (!o.ok)
          throw new Error(`Failed to fetch workflows: ${o.statusText}`);
        const d = (i = (await o.json()).workflows) == null ? void 0 : i[0];
        if (!d)
          throw new Error("No workflows found");
        const g = d.components.map((n, m) => ({
          id: n.id,
          type: n.id,
          position: { x: m * 200, y: 100 },
          data: { label: n.id, subscribe: n.subscribe }
        }));
        t(g), c(!1);
      } catch (o) {
        w(o.message), c(!1);
      }
    }
    u();
  }, []), { nodes: s, edges: e, loading: l, error: f };
}
const a = /* @__PURE__ */ Object.assign({});
console.log("Found modules:", a);
const h = {};
for (const s in a) {
  const t = s.match(/components\/([^/]+)\/ui\.jsx$/);
  if (t) {
    const e = t[1];
    console.log("Registering component:", e), h[e] = a[s].default;
  }
}
export {
  h as nodeTypes,
  E as useMotiaFlow
};
