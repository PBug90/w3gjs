const objectIdFormatter = (arr) => {
  // console.log(arr.toString(16).split(',').reverse().map(a => String.fromCharCode(parseInt(a,10))).join(''))
  let s = arr.reverse().map(a => parseInt(a, 10))
  if (s[0] >= 0x41 && s[0] <= 0x7A) {
    let test = arr.map(e => String.fromCharCode(parseInt(e, 10))).join('')
    // console.log("test ", test)
    return test
  }
  return arr.toString(16)
}

const raceFlagFormatter = (flag) => {
  switch (flag){
    case 0x01:
      return 'H'
    case 0x02:
      return 'O'
    case 0x04:
      return 'N'
    case 0x08:
      return 'U'
    case 0x20:
      return 'R'
  }
  return flag
}

const chatModeFormatter = (flag) => {
  switch (flag){
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
