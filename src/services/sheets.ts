export async function fetchPointsByName(name: string): Promise<number> {
  const key = import.meta.env.VITE_GOOGLE_API_KEY as string
  const id = import.meta.env.VITE_SHEET_ID as string
  const range = import.meta.env.VITE_SHEET_RANGE as string // e.g. Sheet1!A:B

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(range)}?key=${key}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sheets API error: ${res.status}`)
  const data = await res.json()

  // rows: [["E-Ting","25"], ["S-Ting","..."], ...]
  const rows: string[][] = data?.values ?? []
  const row = rows.find(r => (r[0] ?? '').trim() === name)
  const val = row?.[1] ?? '0'
  const n = Number(val)
  return Number.isFinite(n) ? n : 0
}
