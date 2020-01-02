const playerColor = (color: number): string => {
    switch (color) {
        case 0:
            return '#ff0303'
        case 1:
            return '#0042ff'
        case 2:
            return '#1ce6b9'
        case 3:
            return '#540081'
        case 4:
            return '#fffc00'
        case 5:
            return '#fe8a0e'
        case 6:
            return '#20c000'
        case 7:
            return '#e55bb0'
        case 8:
            return '#959697'
        case 9:
            return '#7ebff1'
        case 10:
            return '#106246'
        case 11:
            return '#4a2a04'
        case 12:
            return '#9b0000'
        case 13:
            return '#0000c3'
        case 14:
            return '#00eaff'
        case 15:
            return '#be00fe'
        case 16:
            return '#ebcd87'
        case 17:
            return '#f8a48b'
        case 18:
            return '#bfff80'
        case 19:
            return '#dcb9eb'
        case 20:
            return '#282828'
        case 21:
            return '#ebf0ff'
        case 22:
            return '#00781e'
        case 23:
            return '#a46f33'
        default:
            return '000000'
    }
}

const gameVersion = (version: number): string => {
    if (version === 10030) {
        return '1.30.2+'
    } else if (version > 10030) {
        const str = String(version)
        return `1.${str.substring(str.length - 2, str.length)}`
    }
    return `1.${version}`
}

const mapFilename = (mapPath: string): string => {
    const fragment = mapPath.split('\\').pop()
    if (fragment !== undefined) {
        return <string>fragment.split('//').pop()
    }
    return ''
}

export default {
    playerColor,
    gameVersion,
    mapFilename
}
