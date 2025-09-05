import { v4 as uuidv4 } from 'uuid'

/**
 * 生成UUID
 * @returns {string} 返回生成的UUID
 */
export function createUUID() {
  return uuidv4()
}

/**
 * 生成带时间戳的UUID
 * @returns {string} 返回生成的UUID
 */
export function createTimeUUID() {
  const timestamp = new Date().getTime()
  const uuid = uuidv4()
  return `${timestamp}-${uuid}`
}
