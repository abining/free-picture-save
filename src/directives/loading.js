import { ElLoading } from 'element-plus'

const loadingDirective = {
    mounted(el, binding) {
        const instance = ElLoading.service({
            target: el,
            fullscreen: binding.modifiers.fullscreen,
            text: binding.value?.text || '加载中...',
            background: binding.value?.background || 'rgba(255, 255, 255, 0.7)',
            customClass: binding.value?.customClass || ''
        })
        el._loading_instance = instance
    },
    updated(el, binding) {
        const instance = el._loading_instance
        if (instance) {
            if (!binding.value && binding.oldValue) {
                instance.close()
                el._loading_instance = null
            }
        } else if (binding.value) {
            const instance = ElLoading.service({
                target: el,
                fullscreen: binding.modifiers.fullscreen,
                text: binding.value?.text || '加载中...',
                background: binding.value?.background || 'rgba(255, 255, 255, 0.7)',
                customClass: binding.value?.customClass || ''
            })
            el._loading_instance = instance
        }
    },
    unmounted(el) {
        if (el._loading_instance) {
            el._loading_instance.close()
            el._loading_instance = null
        }
    }
}

export default loadingDirective 