/**
 * Minimal YAML syntax highlighter — zero deps.
 * Returns HTML string with span-wrapped tokens.
 */
export function highlightYAML(yaml: string): string {
  const lines = yaml.split('\n')
  return lines.map((line, i) => {
    const num = `<span class="text-muted-foreground/40 select-none mr-3 text-2xs w-5 inline-block text-right">${i + 1}</span>`

    // Comment line
    if (/^\s*#/.test(line)) {
      return `${num}<span class="text-muted-foreground/60">${escape(line)}</span>`
    }

    // Key: value
    const match = line.match(/^(\s*)([\w-]+):(\s*)(.*)$/)
    if (match) {
      const [, indent, key, space, value] = match
      let colored = `${escape(indent)}<span class="text-blue-400">${escape(key)}</span>:${escape(space)}`

      if (!value || value === '') {
        // empty value
      } else if (/^['"].*['"]$/.test(value) || /^\d+\.?\d*$/.test(value) || /^(true|false)$/i.test(value)) {
        colored += `<span class="text-green-400">${escape(value)}</span>`
      } else if (value.startsWith('[') && value.endsWith(']')) {
        colored += `<span class="text-yellow-400">${escape(value)}</span>`
      } else {
        colored += `<span class="text-foreground/80">${escape(value)}</span>`
      }

      return `${num}${colored}`
    }

    // List item
    if (/^\s*-\s/.test(line)) {
      return `${num}<span class="text-yellow-400">${escape(line)}</span>`
    }

    return `${num}${escape(line)}`
  }).join('\n')
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * CSV export — filtered rows to file download.
 */
export function exportCSV(rows: Record<string, unknown>[], filename: string): void {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0] as object)
  const BOM = '﻿'
  const csv = BOM + [
    headers.join(','),
    ...rows.map(r => headers.map(h => JSON.stringify((r as Record<string, unknown>)[h] ?? '')).join(','))
  ].join('\n')
  download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename)
}

export function exportJSON(rows: Record<string, unknown>[], filename: string): void {
  const json = JSON.stringify(rows, null, 2)
  download(new Blob([json], { type: 'application/json' }), filename)
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportFilename(prefix: string): string {
  const d = new Date().toISOString().slice(0, 10)
  return `${prefix}_${d}_filtered.csv`
}
