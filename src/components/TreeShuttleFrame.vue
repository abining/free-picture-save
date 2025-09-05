 
<template>
    <el-row>
      <el-col :span="11">
        <el-row>
          <el-form :inline="true" class="demo-form-inline" @submit.prevent>
            <el-form-item prop="nodeName">
              <el-input v-model.trim="nodeName" style="width: 200px" placeholder="输入目录名称搜索目录" clearable />
              <el-button type="primary" @click="searchDeviceCatalog" style="margin-left: 10px">搜索</el-button>
              <el-button type="primary" @click="selectAll">全选</el-button>
            </el-form-item>
          </el-form>
        </el-row>
   
        <el-row>
          <el-tree-v2 v-loading="leftLoad" ref="leftTreeDataRef" style="width: 100%; border: 1px solid var(--el-border-color); height: 400px" :height="400" :data="leftTreeData" :props="treePropsMap" show-checkbox node-key="id" check-strictly :filter-method="filterLeftNode" @check-change="checkChangeLeft" />
        </el-row>
        <el-row class="mt-4">
          <el-text type="danger" size="small">
            <el-icon>
              <WarningFilled />
            </el-icon>
            请通过勾选基础目录前的选择框选择需要移动的通道或目录
          </el-text>
        </el-row>
      </el-col>
   
      <el-col :span="2" class="m-auto">
        <el-space direction="vertical" style="width: 100%">
          <el-button type="primary" plain :icon="ArrowLeft" @click="handleLeft" />
          <el-button type="primary" plain :icon="ArrowRight" @click="handleRight" />
        </el-space>
      </el-col>
   
      <el-col :span="11">
        <el-row>
          <!-- 单选 -->
          <el-form>
            <el-form-item label="基础目录">
              <el-radio-group v-model="baseCatalogSelect">
                <el-radio label="1">全部显示</el-radio>
                <el-radio label="2">仅显示挂载目录及其父目录</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-row>
   
        <el-row>
          <el-tree-v2 v-loading="rightLoad" ref="rightTreeDataRef" :height="400" style="width: 100%; border: 1px solid var(--el-border-color); height: 400px" :data="rightTreeData" :props="treePropsMap" node-key="id" expand-on-click-node show-checkbox check-strictly @check-change="checkChangeRight" highlight-current :filter-method="filterRightNode" />
        </el-row>
      </el-col>
    </el-row>
  </template>
   
  <script lang="ts" setup>
  import { ArrowRight, ArrowLeft, WarningFilled } from '@element-plus/icons-vue'
  import lodash from 'lodash'
  defineOptions({ name: 'CatalogMount' })
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { Action } from 'element-plus'
  //生成一个不重复的uuid
  import { randomId } from '@/utils/random'
  import { ElTree } from 'element-plus'
  import { handleTree } from '@/utils/tree'
   
  // 定义事件驱动
  const emits = defineEmits(['getLeftData', 'getRightData'])
  const page = ref({
    pageNo: 1,
    pageSize: 50,
    total: 0
  })
  interface Tree {
    [key: string]: any
  }
  const props = defineProps({
    leftTree: {
      type: Array
    },
    rightTree: {
      type: Array
    }
  })
   
  const rightLoad = ref(true)
  const leftLoad = ref(true)
  const treePropsMap = {
    value: 'id',
    label: 'name',
    children: 'children'
    // disabled: 'disabled'
  }
  //左树数据
  const leftTreeDataRef = ref()
  const leftTreeData = ref([]) as Ref<any[]>
  //全选还是仅显示挂载目录及其父目录
  const baseCatalogSelect = ref('1')
  //右树数据
  const rightTreeDataRef = ref()
  const rightTreeData = ref([]) as Ref<any[]>
  //左树搜索
  const leftTreeSearch = reactive({
    nodeName: '',
    deviceNumber: ''
  })
  const nodeName = ref('')
  //请求数据暂存
  const rightDataTemporary = ref([] as any[])
  //按钮仅显示挂载目录及其父目录的暂存数据
  const zancun = ref([] as any[])
  //--------------------------------------------------工具函数---------------------------------------------
  //工具方法：递归设置某个字段的值
  const setValue = (list, bol) => {
    list = list.map((item) => {
      if (item.children.length > 0) {
        item.children = setValue(item.children, bol)
      }
   
      return { ...item, disabled: bol }
    })
    return list
  }
  const setLeftValueMont = (list) => {
    list = list.map((item) => {
      if (item.children.length > 0) {
        item.children = setLeftValueMont(item.children)
      }
      if (item.mount === true) {
        return { ...item, disabled: true }
      } else {
        return { ...item, disabled: false }
      }
    })
    return list
  }
   
  const checkChangeLeft = (node, checked) => {
    //全部取消/选择
    const setChecked = (arr, ifChecked) => {
      arr?.map((item) => {
        if (item.disabled !== true) {
          leftTreeDataRef.value.setChecked(item.id, ifChecked)
   
          if (!!item?.children?.length) {
            setChecked(item?.children, ifChecked)
          }
        } else {
          leftTreeDataRef.value.setChecked(item.id, false)
   
          if (!!item?.children?.length) {
            setChecked(item?.children, false)
          }
        }
      })
    }
    //如果为取消
    if (checked === false) {
      //如果当前节点有子集
      //循环子集将他们的选中取消
      setChecked(node?.children ?? [], false)
    } else {
      //否则(为选中状态)
      //判断父节点id是否为空
      if (node.pid !== 'all') {
        //如果不为空则将其选中
        //循环子集将他们选中
        setChecked(node?.children ?? [], true)
      }
    }
  }
  const checkChangeRight = (node, checked) => {
    //全部取消/选择
    const setChecked = (arr, ifChecked) => {
      arr?.map((item) => {
        rightTreeDataRef.value.setChecked(item.id, ifChecked)
        if (!!item?.children?.length) {
          setChecked(item?.children, ifChecked)
        }
      })
    }
    //如果为取消
    if (checked === false) {
      //如果当前节点有子集
      //循环子集将他们的选中取消
      setChecked(node?.children ?? [], false)
    } else {
      //否则(为选中状态)
      //判断父节点id是否为空
      if (node.pid !== 'all') {
        //如果不为空则将其选中
        //循环子集将他们的选中取消
        setChecked(node?.children ?? [], true)
      }
    }
  }
   
  //递归查询父节点的子数组里有没有一个id在childCheckedKeys里如果有保留如果没有删除那一个
  const filterTreeByCheckedKeys = (treeData, childCheckedKeys) => {
    return treeData.map((node) => {
      const filteredChildren = node.children.filter((child) => childCheckedKeys.includes(child.id))
   
      // 保留当前节点，并递归过滤其子节点
      return {
        ...node,
        children: filterTreeByCheckedKeys(filteredChildren, childCheckedKeys)
      }
    })
  }
   
  //递归删除将要删除的内存节点
  const deleteNodeUtil = (list, node) => {
    for (let i = list.length - 1; i >= 0; i--) {
      const current = list[i]
   
      if (current.id === node.id) {
        list.splice(i, 1)
        return
      }
      if (current.children && current.children.length > 0) {
        deleteNodeUtil(current.children, node)
        // 如果在子列表中删除了节点，检查是否需要收缩父节点的 children
      }
    }
  }
  //递归添加相同节点的数据
  const isExist = ref(false)
  const insertNodeUtil = (list, node, clickNode) => {
    if (!list) {
      return
    }
    list.forEach((a) => {
      if (a.children.length > 0) {
        insertNodeUtil(a.children, node, clickNode)
      }
      if (a.id && a.id === clickNode.data.id) {
        a.children.push(node)
        isExist.value = true
        console.log(rightDataTemporary.value)
      }
      return
    })
  }
  //递归查询是否为通道如果为通道将disabled设为true；
  const isChannel = (node) => {
    if (node.children.length === 0) {
      if (!node.parental) {
        leftTreeDataRef.value.getNode(node).data.disabled = true
      }
      return
    }
    node.children.forEach((item) => {
      if (item.children.length > 0) {
        isChannel(item)
      }
      if (!item.parental) {
        leftTreeDataRef.value.getNode(item).data.disabled = true
      }
    })
  }
  //递归查询右边选中的树是否为通道只把左边为通道的树disabled设为false
  const isChannel2 = (node) => {
    if (node.children.length === 0) {
      if (!node.parental) {
        leftTreeDataRef.value.getNode(node).data.disabled = false
      }
      return
    }
    node.children.forEach((item) => {
      if (item.children.length > 0) {
        isChannel2(item)
      }
      if (!item.parental) {
        leftTreeDataRef.value.getNode(item).data.disabled = false
      }
    })
  }
  //递归查询子树的id
  const selectId = (node, zn) => {
    if (node.children.length === 0) {
      return
    }
    node.children.forEach((item) => {
      if (item.children.length > 0) {
        selectId(item, zn)
      }
      zn.children.push(item.id)
    })
  }
  //如果为目录把id 都改了
  const randomIdUtil = (node) => {
    if (node.children.length === 0) {
      if (node.parental) {
        node.id = randomId()
      }
      return
    }
    node.children.forEach((item) => {
      if (item.children.length > 0) {
        randomIdUtil(item)
      }
      if (item.parental) {
        item.id = randomId()
      }
    })
  }
   
  //递归查询子树的id
  const setCheckedV2 = (node, zn) => {
    leftTreeDataRef.value.setChecked(node.id, zn)
    if (node.children.length > 0) {
      node.children.forEach((item) => {
        setCheckedV2(item, zn)
      })
    }
  }
  const setCheckedV2R = (node, zn) => {
    rightTreeDataRef.value.setChecked(node.id, zn)
    if (node.children.length > 0) {
      node.children.forEach((item) => {
        setCheckedV2R(item, zn)
      })
    }
  }
  const setCheckedAll = (node, zn) => {
    if (node.disabled === false) {
      leftTreeDataRef.value.setChecked(node.id, zn)
    }
    if (node.children.length > 0) {
      node.children.forEach((item) => {
        setCheckedAll(item, zn)
      })
    }
  }
  //-----------------------------------------以上为工具函数-------------------------------------------------------
  const clickOnce = ref(false)
  //全选
  const selectAll = () => {
    if (!clickOnce.value) {
      leftTreeData.value.forEach((node) => {
        setCheckedAll(node, true)
      })
      clickOnce.value = true
    } else {
      leftTreeData.value.forEach((node) => {
        setCheckedV2(node, false)
      })
      clickOnce.value = false
    }
  }
  //左树搜索
  const searchDeviceCatalog = () => {
    w2.value = false
    leftTreeSearch.nodeName = nodeName.value
  }
   
  //中间
  const handleLeft = () => {
    let allCheckedNodes = rightTreeDataRef.value.getCheckedNodes(false, false)
    //只返回当前选择的子节点数组。
    let childCheckedKeys = rightTreeDataRef.value.getCheckedKeys(true)
    //全选和不全选的id
    let allCheckedKeys = rightTreeDataRef.value.getCheckedKeys(false)
    //取差得到所有全选的id
    let allFullCheckedKeys = allCheckedKeys.filter((a) => {
      return !childCheckedKeys.includes(a)
    })
   
    let resultCheckedNodes = allCheckedNodes.filter((b) => {
      return !allFullCheckedKeys.includes(b.parentId)
    })
   
    let resultCopyCheckedNodes = lodash.cloneDeep(resultCheckedNodes)
    console.log(resultCopyCheckedNodes, 'resultCopyCheckedNodes')
    //resultCopyCheckedNodes是选中的集合  下面是前端演示的时候的代码，联调时直接将这个集合作为参数删除他就行
    resultCopyCheckedNodes.forEach((w) => {
      setCheckedV2R(w, false)
      rightTreeDataRef.value.getNode(w).parent.data.children.splice(
        rightTreeDataRef.value.getNode(w).parent.data.children.findIndex((child) => child.id === w.id),
        1
      )
   
      if (!w.parental) {
        leftTreeDataRef.value.getNode(w).data.disabled = false
      }
      //递归查询右边选中的树是否为通道只把左边为通道的树disabled设为false
      isChannel2(w)
      for (let i = rightDataTemporary.value.length - 1; i >= 0; --i) {
        const c = rightDataTemporary.value[i]
        
        if (w.id === c.id) {
          rightDataTemporary.value.splice(i, 1)
          return
        }
        if (c.children.length > 0) {
          deleteNodeUtil(c.children, w)
        }
   
      }
    })
   
    let allCheckeds = allCheckedNodes.map((al) => {
      return al.id
    })
    console.log(allCheckedKeys)
    //删除暂存里的数据
    zancun.value.forEach((zn) => {
      zn.children = zn.children.filter((ch) => !allCheckeds.includes(ch))
    })
   
    //判断暂存里是否有数据的children为空了为空删除自己
    for (let i = zancun.value.length - 1; i >= 0; --i) {
      const zn = zancun.value[i]
   
      if (zn.children.length === 0) {
        zancun.value.splice(i, 1)
      }
    }
   
    if (baseCatalogSelect.value === '2') {
      //扁平化过滤
      let zancunMap = [] as any[]
      zancun.value.forEach((zn) => {
        zancunMap.push(zn.parentId)
        zn.children.forEach((ch) => {
          zancunMap.push(ch)
        })
      })
      rightTreeDataRef.value!.filter(zancunMap)
    }
    rightTreeDataRef.value.setData(rightTreeData.value)
    leftTreeDataRef.value.setData(leftTreeData.value)
  }
  const rightMove = (params) => {}
  //右移动
  const handleRight = () => {
    let allCheckedNodes = leftTreeDataRef.value.getCheckedNodes(false)
    //只返回当前选择的子节点数组。
    let childCheckedKeys = leftTreeDataRef.value.getCheckedKeys(true)
    //全选和不全选的id
    let allCheckedKeys = leftTreeDataRef.value.getCheckedKeys(false)
    //取差得到所有全选的id
    let allFullCheckedKeys = allCheckedKeys.filter((a) => {
      return !childCheckedKeys.includes(a)
    })
    console.log('执行了1111111111111111111111111')
    // console.log(allFullCheckedKeys, 'all')
    let resultCheckedNodes = allCheckedNodes.filter((b) => {
      return !allFullCheckedKeys.includes(b.parentId)
    })
    let w = filterTreeByCheckedKeys(resultCheckedNodes, allCheckedKeys)
    // console.log(w, 'res')
    let resultCopyCheckedNodes = lodash.cloneDeep(w)
    let rightClickedKey = rightTreeDataRef.value.getCurrentKey()
    if (rightClickedKey) {
      //判断点击rightClickedKey中子节点有没有通道有通道不能移动
      let rightNode = rightTreeDataRef.value.getNode(rightClickedKey).data
      console.log(rightNode, 'ri')
      if (rightNode.parental === false) {
        ElMessageBox.alert('不能将目录和通道挂载在通道下！', '警告', {
          confirmButtonText: 'OK',
          callback: (action: Action) => {
            ElMessage({
              type: 'info',
              message: `请重新挂载！`
            })
          }
        })
        return
      }
      if (rightNode.children.length > 0) {
        let rgBool = rightNode.children.some((rn) => {
          return rn.parental === false
        })
        //有通道
        if (rgBool) {
          let rcBool = resultCopyCheckedNodes.some((nod) => {
            return nod.parental === true
          })
          if (rcBool) {
            ElMessageBox.alert('不能携带目录挂载到已有通道的目录下！', '警告', {
              // if you want to disable its autofocus
              // autofocus: false,
              confirmButtonText: 'OK',
              callback: (action: Action) => {
                ElMessage({
                  type: 'info',
                  message: `请重新挂载！`
                })
              }
            })
            return
          }
        }
      }
      let zancunTemporary = {
        parentId: rightClickedKey,
        children: [] as any[]
      }
      if (!zancun.value.some((s) => s.parentId === rightClickedKey) || !zancun.value) {
        zancun.value.push(zancunTemporary)
      }
      console.log('执行了222222222222222222222')
      resultCopyCheckedNodes.forEach((node) => {
        setCheckedV2(node, false)
   
        let n = lodash.cloneDeep(node)
   
        if (n.parental) {
          n.id = randomId()
        }
   
        randomIdUtil(n)
        let zann = lodash.cloneDeep(n)
        zancun.value.forEach((zn) => {
          if (zn.parentId === rightClickedKey) {
            zn.children.push(zann.id)
            selectId(zann, zn)
          }
        })
   
        console.log(n, rightDataTemporary.value, '222222')
        rightTreeDataRef.value.getNode(rightClickedKey).data.children.push(n)
   
        let nn = lodash.cloneDeep(n)
   
        // leftTreeDataRef.value.setChecked(node.id, false)
        rightDataTemporary.value.forEach((c) => {
          nn.parentId = rightClickedKey
          console.log(c.id, nn.parentId)
          if (c.id === nn.parentId) {
            console.log('sadasdasdsadssssssssssss')
            c.children.push(nn)
            isExist.value = true
          } else {
            insertNodeUtil(c.children, nn, rightTreeDataRef.value.getNode(rightClickedKey))
          }
   
          //  if(c.parentId === rightClickedKey){
   
          //     c.children.push(nn)
          //   }else{
          //     nn.parentId = rightClickedKey
          //     rightDataTemporary.value.push(nn)
          //   }
        })
        if (!isExist.value) {
          nn.parentId = rightClickedKey
          rightDataTemporary.value.push(nn)
        }
        console.log('执行了33333333333333')
        if (!node.parental) {
          leftTreeDataRef.value.getNode(node).data.disabled = true
        }
        isChannel(node)
      })
   
      if (baseCatalogSelect.value === '2') {
        //扁平化过滤
        let zancunMap = [] as any[]
        zancun.value.forEach((zn) => {
          zancunMap.push(zn.parentId)
          zn.children.forEach((ch) => {
            zancunMap.push(ch)
          })
        })
        nextTick(() => {
          rightTreeDataRef.value!.filter(zancunMap)
        })
      }
    
   
      rightTreeDataRef.value.setData(rightTreeData.value)
      leftTreeDataRef.value.setData(leftTreeData.value)
      isExist.value = false
    } else {
      ElMessage.error('请先选中右树目录')
    }
  }
   
  //父组件在调插入接口后必须调用这个方法
  const resetLeftAndRight = () => {
    zancun.value = []
    rightDataTemporary.value = [] as any[]
    if (baseCatalogSelect.value === '2') {
      rightTreeDataRef.value!.filter([])
    }
    rightLoad.value = true
    leftLoad.value = true
    emits('getLeftData')
    emits('getRightData')
  }
   
  const filterRightNode = (value: any[], data: Tree) => {
    if (!value) {
      return true
    } else {
      return value.includes(data.id)
    }
  }
  const w2 = ref(false)
  //左树过滤
  const filterLeftNode = (value: string, data: Tree) => {
    if (!value) return true // 如果没有搜索值，则显示所有节点
    if (w2.value == true) return true
   
    if (!data.parentId && data.name.includes(value)) {
      w2.value = true
    }
   
    return data.name.includes(value)
  }
   
  watch(baseCatalogSelect, (val) => {
    if (val === '1') {
      rightTreeDataRef.value!.filter()
      for (let i = 0; i < rightTreeData.value.length; i++) {
        rightTreeDataRef.value.collapseNode(rightTreeDataRef.value.getNode(rightTreeData.value[i]))
      }
    } else {
      let zancunMap = [] as any[]
      zancun.value.forEach((zn) => {
        zancunMap.push(zn.parentId)
        zn.children.forEach((ch) => {
          zancunMap.push(ch)
        })
      })
      rightTreeDataRef.value!.filter(zancunMap)
    }
  })
  watch(
    () => leftTreeSearch.nodeName,
    (val) => {
      leftTreeDataRef.value!.filter(val)
    }
  )
   
  watch(
    () => props.rightTree,
    (curr) => {
      if (curr) {
        rightTreeData.value = setValue(curr, true)
      }
    },
    { immediate: true }
  )
  watch(
    () => props.leftTree,
    (curr) => {
      if (curr) {
        leftTreeData.value = setLeftValueMont(curr)
      }
    },
    { immediate: true }
  )
  //抛出去的必用属性及方法
  //resetLeftAndRight方法在每次发送完提交挂载请求之后调用一次
  //rightDataTempoary为需要增添的数据 数据结构为[{},{}]
  defineExpose({ resetLeftAndRight, rightDataTemporary, leftLoad, rightLoad })
  </script>
   
  <style scoped>
  :deep(.demo-form-inline .el-input) {
    --el-input-width: 220px;
  }
  :deep(.el-checkbox.is-disabled) {
    display: none !important;
  }
  </style>