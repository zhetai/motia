var m = Object.defineProperty;
var b = (s, o, e) => o in s ? m(s, o, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[o] = e;
var p = (s, o, e) => b(s, typeof o != "symbol" ? o + "" : o, e);
import { useState as d, useEffect as k } from "react";
const t = class t {
  static registerNodeTypesFromGlob(o) {
    const e = {};
    for (const i in o) {
      const r = i.match(/components\/([^/]+)\/ui\.jsx$/);
      if (r) {
        const a = r[1];
        e[a] = o[i].default;
      }
    }
    t.nodeTypes = { ...t.nodeTypes, ...e }, console.log("MotiaUi bootstrap completed. NodeTypes:", t.nodeTypes);
  }
  static getNodeTypes() {
    return t.nodeTypes;
  }
};
p(t, "nodeTypes", {});
let w = t;
function F() {
  const [s, o] = d([]), [e, i] = d([]), [r, a] = d(!0), [u, y] = d(null);
  return k(() => {
    async function T() {
      var f;
      try {
        const n = await fetch("/api/workflows");
        if (!n.ok)
          throw new Error(`Failed to fetch workflows: ${n.statusText}`);
        const l = (f = (await n.json()).workflows) == null ? void 0 : f[0];
        if (!l)
          throw new Error("No workflows found");
        const g = l.components.map((c, h) => ({
          id: c.id,
          type: c.id,
          position: { x: h * 200, y: 100 },
          data: { label: c.id, subscribe: c.subscribe }
        }));
        o(g), a(!1);
      } catch (n) {
        y(n.message), a(!1);
      }
    }
    T();
  }, []), { nodes: s, edges: e, loading: r, error: u };
}
export {
  w as MotiaUi,
  F as useMotiaFlow
};
