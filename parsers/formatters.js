const objectIdFormatter = (arr) => {
  let copy = arr
  if (arr[3] >= 0x41 && arr[3] <= 0x7A) {
    copy = arr.slice()
    return arr.map(e => String.fromCharCode(parseInt(e, 10))).join('')
  }
  return copy
}

const raceFlagFormatter = (flag) => {
  switch (flag) {
    case 0x01:
    case 0x41:
      return 'H'
    case 0x02:
    case 0x42:
      return 'O'
    case 0x04:
    case 0x44:
      return 'N'
    case 0x08:
    case 0x48:
      return 'U'
    case 0x20:
    case 0x60:
      return 'R'
  }
  return flag
}

const chatModeFormatter = (flag) => {
  switch (flag) {
    case 0x00:
      return 'ALL'
    case 0x01:
      return 'ALLY'
    case 0x02:
      return 'OBS'
  }
  return flag
}

module.exports = {
  objectIdFormatter,
  raceFlagFormatter,
  chatModeFormatter
}
