BEGIN { RS = "\f" }
{
  gsub(/\r/, "", $0)
  count = split($0, lines, "\n")
  emitted = 0
  printf("PAGE %d", NR)
  for (i = 1; i <= count && emitted < 6; i++) {
    line = lines[i]
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", line)
    gsub(/[[:space:]]+/, " ", line)
    if (line == "" || length(line) < 3) continue
    printf(" | %s", substr(line, 1, 180))
    emitted++
  }
  printf("\n")
}
