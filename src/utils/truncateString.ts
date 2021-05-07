export function truncateStringMiddle(
  str: string,
  beginning: number,
  end: number
): string {
  return str.slice(0, beginning) + '...' + str.slice(str.length - end, str.length)
}
