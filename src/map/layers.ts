// ─────────────────────────────────────────────────────────────────────────
// Filter-field → visualization-layer-title mapping, and the list of layers
// the app cares about. Ported from the filter-layer-sync widget config.
// ─────────────────────────────────────────────────────────────────────────

/** The layer whose definitionExpression reflects the combined filter. */
export const SELECTED_LAYER_TITLE = 'Selected streets'

/** Filter field → visualization layer (canonical English titles). */
export const FILTER_LAYER_MAPPINGS: Array<{ filterField: string; layerTitle: string }> = [
  { filterField: 'summer_SI', layerTitle: 'Spring/Summer Shade Index' },
  { filterField: 'ABw2k_max', layerTitle: 'Neighbourhood transit' },
  { filterField: 'ABw5k_max', layerTitle: 'City transit' },
  { filterField: 'AIw1kH_mea', layerTitle: 'Local centers' },
  { filterField: 'FSI500_mea', layerTitle: 'Building density' },
  { filterField: 'ARw500lm_1', layerTitle: 'Access to shops and restaurants' },
  { filterField: 'ADws_mean', layerTitle: 'School or preschool proximity' },
  { filterField: 'ADwm_mean', layerTitle: 'Tram, metro or railway station proximity' },
  { filterField: 'ADwbu_mean', layerTitle: 'Bus stop proximity' }
]

/**
 * Filter fields the SQL parser must recognise. Includes every visualization
 * layer's field PLUS `width` (which affects "Selected streets" only — it has
 * no visualization layer). Omitting `width` here silently drops width
 * filtering, the bug fixed in the ExB app.
 */
export const KNOWN_FILTER_FIELDS = [
  ...FILTER_LAYER_MAPPINGS.map(m => m.filterField),
  'width'
]

/** All layer titles that carry the cumulative filter expression. */
export const FILTERABLE_LAYER_TITLES = [
  ...FILTER_LAYER_MAPPINGS.map(m => m.layerTitle),
  SELECTED_LAYER_TITLE
]
