为避免层级、布局和事件体系导致的副作用（例如受父元素的CSS影响）

**模态框通常挂在 document.body 或根节点下**

# 直接 DOM 操作

首先我想的是

```tsx
const modal = document.createElement('div')
modal.className = 'modal'
document.body.appendChild(modal)
```

然后配置 z-index 置顶、 position: fixed 覆盖全页面

但是直接原生 DOM 会导致 重排、重绘 ，性能耗散！

> 所以在 React 和 Vue 的框架层面做了处理，需要让模态框挂载位置正确的同时能走 **diff** 判断进行性能优化，防止重复 mount,unmount 导致的销毁与重建，还会减少 CLS 提升 SEO
> 

# React - Portal传送门

```tsx
ReactDOM.createPortal(
  <Modal />,
  document.body
)
```

在组件关系逻辑树 Fiber Tree 中，管理组件关系和生命周期等等

模态框作为一个组件即一个 Fiber 节点进行插入

```tsx
App
 └── Page
      └── Modal
```

但是在 DOM 中模态框并不是Page的子组件，而是直接挂在 body 下面的

```tsx
<body>
 ├── #root
 │    └── Page
 └── Modal
```

**Portal 改变了 DOM 的插入位置**

这样就实现了 模态框仍然会在 React Render 中进行 虚拟diff 进行性能优化

# Vue - Teleport瞬移

直接写进了语法层

```tsx
<Teleport to="body">
  <Modal v-if="open" />
</Teleport>
```

本质和 React Portal 基本一致

- 虚拟节点标记 teleport
- patch 阶段插入到指定容器
- diff 范围仅限在 Teleport 子树中

# 直接JS操作

那么其实我们要优化的就是避免重复的创建

所以可以通过单例模式在全局作用域下面进行 let 的内存管理，防止重复的GC回收和创建导致的重排重绘

```tsx
let modalEl

function getModal() {
  if (!modalEl) {
    modalEl = document.createElement('div')
    modalEl.className = 'modal'
    document.body.appendChild(modalEl)
  }
  return modalEl
}
```