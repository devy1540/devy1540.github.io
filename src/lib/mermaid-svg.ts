// 캐시한 SVG를 다른 그림이나 확대 화면에서 쓸 때 ID와 참조를 분리한다.
export function createMermaidSvg(source: string, namespace: string) {
  const container = document.createElement("div")
  container.innerHTML = source
  const svg = container.querySelector("svg")
  if (!svg) throw new Error("Mermaid did not return an SVG")
  const elements = [svg, ...Array.from(svg.querySelectorAll("*"))]
  const ids = new Map<string, string>()
  for (const element of elements) if (element.id) ids.set(element.id, `${namespace}-${ids.size}`)
  const escapedIds = Array.from(ids.keys()).sort((a, b) => b.length - a.length).map(id => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const cssIds = escapedIds.length ? new RegExp(`#(${escapedIds.join("|")})(?![\\w-])`, "g") : undefined
  for (const element of elements) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name === "id") element.setAttribute("id", ids.get(attribute.value)!)
      else if (attribute.name === "aria-labelledby" || attribute.name === "aria-describedby") {
        element.setAttribute(attribute.name, attribute.value.split(/\s+/).map(id => ids.get(id) ?? id).join(" "))
      } else {
        if (!attribute.value.includes("url(") && !attribute.value.startsWith("#")) continue
        const value = attribute.value.replace(/url\(["']?#([^\s)'"\\]+)["']?\)/g, (reference, id: string) => ids.has(id) ? `url(#${ids.get(id)})` : reference)
        const rewritten = value.startsWith("#") && ids.has(value.slice(1)) ? `#${ids.get(value.slice(1))}` : value
        if (rewritten !== attribute.value) element.setAttribute(attribute.name, rewritten)
      }
    }
    if (element.tagName.toLowerCase() === "style" && cssIds) {
      element.textContent = element.textContent!.replace(cssIds, (_, id: string) => `#${ids.get(id)}`)
    }
  }
  const naturalWidth = Number(svg.getAttribute("viewBox")?.split(/[\s,]+/)[2])
  svg.removeAttribute("height")
  svg.removeAttribute("width")
  svg.style.width = Number.isFinite(naturalWidth) && naturalWidth > 0 ? `${naturalWidth}px` : "100%"
  svg.style.maxWidth = "100%"
  svg.style.height = "auto"
  svg.style.display = "block"
  svg.style.margin = "0 auto"
  svg.querySelectorAll("rect.basic, rect.label-container, .node rect, .cluster rect").forEach(rect => {
    rect.setAttribute("rx", "8"); rect.setAttribute("ry", "8")
  })
  svg.querySelectorAll(".edge-pattern-solid, .flowchart-link, path.path").forEach(path => path.setAttribute("stroke-width", "2"))
  const defs = svg.querySelector("defs") ?? svg.insertBefore(document.createElementNS("http://www.w3.org/2000/svg", "defs"), svg.firstChild)
  const shadow = document.createElementNS("http://www.w3.org/2000/svg", "filter")
  shadow.id = `${namespace}-shadow`
  shadow.innerHTML = '<feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.08" />'
  defs.appendChild(shadow)
  svg.querySelectorAll(".node rect, .node polygon, .node circle, .cluster rect").forEach(node => node.setAttribute("filter", `url(#${shadow.id})`))
  return container.innerHTML
}
