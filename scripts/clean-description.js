function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function cleanDescription(desc, sub) {
  if (!desc) return desc
  let s = desc
  s = s.replace(/https?:\/\/\S+/g, '')
  s = s.replace(new RegExp('/?r/' + escapeRe(sub) + '\\b', 'gi'), '[hidden]')
  s = s.replace(new RegExp('\\b' + escapeRe(sub) + '\\b', 'gi'), '[hidden]')
  s = s.replace(/\*+/g, '')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}
