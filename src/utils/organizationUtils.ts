import {
  DuplicateCandidate,
  DuplicateConfidence,
  IncompleteRecordIssue,
  OrganizationMissingField,
  OrganizationSummary,
  PolaroidRecord,
} from '../types'

const missingFieldDefinitions: Array<{
  key: OrganizationMissingField['key']
  label: string
  isMissing: (record: PolaroidRecord) => boolean
}> = [
  {
    key: 'groupName',
    label: '团体',
    isMissing: record => !hasText(record.groupName),
  },
  {
    key: 'city',
    label: '城市',
    isMissing: record => !hasText(record.city),
  },
  {
    key: 'venue',
    label: '场馆',
    isMissing: record => !hasText(record.venue),
  },
  {
    key: 'price',
    label: '价格',
    isMissing: record => typeof record.price !== 'number',
  },
  {
    key: 'backPhoto',
    label: '背签照片',
    isMissing: record => !recordHasBackPhoto(record),
  },
  {
    key: 'note',
    label: '备注',
    isMissing: record => !hasText(record.note),
  },
  {
    key: 'polaroidType',
    label: '类型',
    isMissing: record => !hasText(record.polaroidType),
  },
  {
    key: 'memberCount',
    label: '人数',
    isMissing: record => !hasText(record.memberCount),
  },
]

const hasText = (value?: string): boolean => {
  return Boolean(value && value.trim().length > 0)
}

const recordHasBackPhoto = (record: PolaroidRecord): boolean => {
  return Boolean(
    record.backPhotoUri ||
      (record.additionalBackPhotoUris &&
        record.additionalBackPhotoUris.length > 0),
  )
}

const normalizeText = (value: string): string => {
  return value.trim().toLowerCase()
}

const getGroupKey = (record: PolaroidRecord): string => {
  return `${normalizeText(record.idolName)}|${record.photoDate}`
}

const allDefinedValuesEqual = <T>(values: Array<T | undefined>): boolean => {
  const definedValues = values.filter(value => value !== undefined)

  if (definedValues.length < values.length || definedValues.length < 2) {
    return false
  }

  return definedValues.every(value => value === definedValues[0])
}

const allTextValuesEqual = (values: Array<string | undefined>): boolean => {
  const normalizedValues = values
    .filter(hasText)
    .map(value => normalizeText(value || ''))

  if (normalizedValues.length < values.length || normalizedValues.length < 2) {
    return false
  }

  return normalizedValues.every(value => value === normalizedValues[0])
}

const getCandidateConfidence = (reasons: string[]): DuplicateConfidence => {
  if (reasons.length >= 3) {
    return 'high'
  }

  if (reasons.length > 0) {
    return 'medium'
  }

  return 'low'
}

const getDuplicateReasons = (records: PolaroidRecord[]): string[] => {
  const reasons: string[] = []

  if (allDefinedValuesEqual(records.map(record => record.price))) {
    reasons.push('价格一致')
  }

  if (allTextValuesEqual(records.map(record => record.city))) {
    reasons.push('城市一致')
  }

  if (allTextValuesEqual(records.map(record => record.venue))) {
    reasons.push('场馆一致')
  }

  if (allTextValuesEqual(records.map(record => record.polaroidType))) {
    reasons.push('类型一致')
  }

  if (allTextValuesEqual(records.map(record => record.memberCount))) {
    reasons.push('人数一致')
  }

  if (allDefinedValuesEqual(records.map(record => record.photoCount))) {
    reasons.push('数量一致')
  }

  return reasons
}

export const getDuplicateCandidates = (
  records: PolaroidRecord[],
): DuplicateCandidate[] => {
  const groups = new Map<string, PolaroidRecord[]>()

  records.forEach(record => {
    const key = getGroupKey(record)
    const currentRecords = groups.get(key) || []
    groups.set(key, [...currentRecords, record])
  })

  return Array.from(groups.entries())
    .filter(([, groupRecords]) => groupRecords.length > 1)
    .map(([key, groupRecords]) => {
      const reasons = getDuplicateReasons(groupRecords)
      const [idolKey, photoDate] = key.split('|')

      return {
        id: `${idolKey}-${photoDate}`,
        idolName: groupRecords[0].idolName,
        photoDate,
        records: groupRecords,
        recordCount: groupRecords.length,
        totalPhotos: groupRecords.reduce(
          (sum, record) => sum + record.photoCount,
          0,
        ),
        totalPrice: groupRecords.reduce(
          (sum, record) => sum + (record.price || 0),
          0,
        ),
        confidence: getCandidateConfidence(reasons),
        reasons,
      }
    })
    .sort((a, b) => {
      const confidenceOrder: Record<DuplicateConfidence, number> = {
        high: 0,
        medium: 1,
        low: 2,
      }

      if (confidenceOrder[a.confidence] !== confidenceOrder[b.confidence]) {
        return confidenceOrder[a.confidence] - confidenceOrder[b.confidence]
      }

      return b.recordCount - a.recordCount
    })
}

export const getIncompleteRecords = (
  records: PolaroidRecord[],
): IncompleteRecordIssue[] => {
  return records
    .map(record => {
      const missingFields = missingFieldDefinitions
        .filter(field => field.isMissing(record))
        .map(({ key, label }) => ({ key, label }))

      return {
        record,
        missingFields,
        missingCount: missingFields.length,
      }
    })
    .filter(issue => issue.missingCount > 0)
    .sort((a, b) => b.missingCount - a.missingCount)
}

export const getOrganizationSummary = (
  records: PolaroidRecord[],
): OrganizationSummary => {
  const duplicateCandidates = getDuplicateCandidates(records)
  const incompleteRecords = getIncompleteRecords(records)

  return {
    duplicateGroupCount: duplicateCandidates.length,
    duplicateRecordCount: duplicateCandidates.reduce(
      (sum, candidate) => sum + candidate.recordCount,
      0,
    ),
    incompleteRecordCount: incompleteRecords.length,
    missingFieldCount: incompleteRecords.reduce(
      (sum, issue) => sum + issue.missingCount,
      0,
    ),
  }
}
