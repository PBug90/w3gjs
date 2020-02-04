import { ActionBlockList } from '../src/parsers/actions'

it('converts alphanumeric action ids using base 10', () => {
    const buff = Buffer.from('12000003000d00ffffffffffffffffb60391458f1b5f45ffffffffffffffff', 'hex')
    const result = ActionBlockList.parse(buff)
    expect(result[0].itemId).toEqual({
        type: 'alphanumeric',
        value: [3, 0, 13, 0]
    })
})
