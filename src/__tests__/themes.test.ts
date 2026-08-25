import { PRESET_THEMES, deriveColors } from '../constants/themes'
import { isColorDark } from '../utils/colorUtils'

describe('deriveColors', () => {
  const core = PRESET_THEMES[0].colors

  it('remaps core tokens to dark values in dark mode', () => {
    const dark = deriveColors(core, true)

    expect(dark.SECONDARY).toBe('#121212')
    expect(dark.WHITE).toBe('#1E1E1E')
    expect(dark.BLACK).toBe('#F2F2F2')
    expect(dark.GRAY[100]).toBe('#2A2A2A')
    expect(dark.ON_PRIMARY).toBe('#FFFFFF')
  })

  it('keeps core tokens unchanged in light mode and ON_PRIMARY white', () => {
    const light = deriveColors(core, false)

    expect(light.SECONDARY).toBe(core.SECONDARY)
    expect(light.WHITE).toBe(core.WHITE)
    expect(light.BLACK).toBe(core.BLACK)
    expect(light.GRAY[100]).toBe(core.GRAY[100])
    expect(light.ON_PRIMARY).toBe('#FFFFFF')
  })
})

describe('isColorDark', () => {
  it('detects black and white hex colors', () => {
    expect(isColorDark('#000000')).toBe(true)
    expect(isColorDark('#FFFFFF')).toBe(false)
  })

  it('handles short hex format', () => {
    expect(isColorDark('#000')).toBe(true)
    expect(isColorDark('#FFF')).toBe(false)
  })

  it('treats rgba colors as dark', () => {
    expect(isColorDark('rgba(0, 0, 0, 0.5)')).toBe(true)
  })
})
