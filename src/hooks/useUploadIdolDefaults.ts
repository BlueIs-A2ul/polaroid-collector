import { useEffect, useState } from 'react'
import { getIdolGroupBinding } from '../services/idolBindingService'
import {
  getIdolDefaultPrice,
  getIdolPriceOptions,
} from '../services/priceStatsService'

export const useUploadIdolDefaults = (idolName: string) => {
  const [globalGroupName, setGlobalGroupName] = useState<string>('')
  const [globalCity, setGlobalCity] = useState<string>('')
  const [globalVenue, setGlobalVenue] = useState<string>('')
  const [defaultPrice, setDefaultPrice] = useState<number | null>(null)
  const [priceOptions, setPriceOptions] = useState<number[]>([])

  useEffect(() => {
    if (!idolName.trim()) {
      setDefaultPrice(null)
      setPriceOptions([])
      setGlobalGroupName('')
      return
    }

    getIdolGroupBinding(idolName).then(({ success, data }) => {
      if (success && data) {
        setGlobalGroupName(data)
      }
    })
    getIdolDefaultPrice(idolName).then(({ success, data }) => {
      if (success && data) {
        setDefaultPrice(data)
      }
    })
    getIdolPriceOptions(idolName).then(({ success, data }) => {
      if (success && data) {
        setPriceOptions(data)
      }
    })
  }, [idolName])

  return {
    globalGroupName,
    globalCity,
    globalVenue,
    defaultPrice,
    priceOptions,
    setGlobalGroupName,
    setGlobalCity,
    setGlobalVenue,
  }
}
