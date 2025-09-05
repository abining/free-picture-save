import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// 设置语言
dayjs.locale('zh-cn')

// 加载插件
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)

// 格式化日期
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    if (!date) return '-'
    return dayjs(date).format(format)
}

// 相对时间
export const fromNow = (date) => {
    if (!date) return '-'
    return dayjs(date).fromNow()
}

// 计算两个日期之间的差值
export const diff = (date1, date2, unit = 'day') => {
    return dayjs(date1).diff(dayjs(date2), unit)
}

// 判断是否为同一天
export const isSameDay = (date1, date2) => {
    return dayjs(date1).isSame(dayjs(date2), 'day')
}

export default dayjs 