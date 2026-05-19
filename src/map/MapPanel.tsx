import { useEffect, useRef } from 'react'
import { useWebMap, findLayerByTitle, type WebMapHandle } from './useWebMap'
import { SELECTED_LAYER_TITLE, FILTER_LAYER_MAPPINGS, FILTERABLE_LAYER_TITLES } from './layers'
import { useLocale } from '../i18n/locale'
import { LAYER_TITLES } from '../i18n/strings'
import MapLayers from './MapLayers'
import MapTools from './MapTools'

// ─────────────────────────────────────────────────────────────────────────
// Hosts the ArcGIS MapView plus the custom MapLayers panel (an exact replica
// of the original ExB Map Layers widget). Reports the ready WebMapHandle
// upward so the calculator/filter can query layers.
// ─────────────────────────────────────────────────────────────────────────

interface Props {
  onReady: (handle: WebMapHandle) => void
}

export default function MapPanel ({ onReady }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const handle = useWebMap(mapRef)
  const locale = useLocale()
  const initDone = useRef(false)

  // On first ready: style "Selected streets", move it to the bottom,
  // and hide the attribute layers (matches the ExB filter-layer-sync setup).
  useEffect(() => {
    if (!handle.ready || !handle.webmap || initDone.current) return
    const webmap = handle.webmap
    // Eagerly stash __canonicalTitle on every layer we care about, BEFORE the
    // locale translation effect can rename any of them. This guarantees later
    // canonical lookups work even when the app starts in Hebrew.
    for (const title of FILTERABLE_LAYER_TITLES) findLayerByTitle(webmap, title)
    const selected = findLayerByTitle(webmap, SELECTED_LAYER_TITLE)
    if (selected) {
      selected.opacity = 1.0
      selected.renderer = {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [151, 151, 151, 1],
          outline: { color: [80, 80, 80, 1], width: 0.5 }
        }
      } as any
      webmap.layers.remove(selected)
      webmap.layers.add(selected, 0)
      selected.visible = true
    }
    for (const m of FILTER_LAYER_MAPPINGS) {
      const layer = findLayerByTitle(webmap, m.layerTitle)
      if (layer) layer.visible = false
    }
    initDone.current = true
    onReady(handle)
  }, [handle, onReady])

  // Stash __canonicalTitle on every layer (keyed off either language's
  // title), so layer lookups keep working. The custom MapLayers component
  // handles localized display itself — we never mutate layer.title here.
  useEffect(() => {
    if (!handle.webmap) return
    const enDict = LAYER_TITLES.en
    const heDict = LAYER_TITLES.he
    const canonicalOf: Record<string, string> = {}
    Object.keys(enDict).forEach(k => { canonicalOf[enDict[k]] = k; canonicalOf[k] = k })
    Object.keys(heDict).forEach(k => { canonicalOf[heDict[k]] = k })
    handle.webmap.allLayers.forEach((layer: any) => {
      if (!layer || typeof layer.title !== 'string') return
      if (layer.__canonicalTitle) return
      const fromMap = canonicalOf[layer.title.trim()]
      if (fromMap) layer.__canonicalTitle = fromMap
    })
  }, [handle.webmap])

  return (
    <div className="map-panel">
      <div ref={mapRef} className="map-view" />
      {handle.error && (
        <div className="map-error">Failed to load map: {handle.error.message}</div>
      )}
      <div className="map-overlay">
        {handle.ready && handle.webmap && handle.view && (
          <MapLayers webmap={handle.webmap} view={handle.view} locale={locale} />
        )}
      </div>
      {handle.ready && handle.view && (
        <div className="map-tools-overlay">
          <MapTools view={handle.view} locale={locale} />
        </div>
      )}
    </div>
  )
}
