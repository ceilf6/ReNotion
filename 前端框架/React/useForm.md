当用户 input 的时候 register 捕获事件，向内写入到formValues并更新formState，接着 subjects 通过观察者模式遍历广播变更，仅订阅了这些 subjects 的 hooks 会调用 useState ，从而触发最小范围的Fiber调度

而普通的 input 做了特判完全不会触发 re-render

而组件库 BeForm 主要做了 UI 层面的封装

通过 useForm() 创建一个表单控制实例，负责表单输入的注册、状态、校验和提交

```tsx
import { useForm } from "react-hook-form";

const {
  register,       // 注册表单项
  handleSubmit,   // 提交函数封装
  watch,          // 监听数据变动
  formState: { errors },  // 获取校验状态
  setValue,
  getValues,
  reset,
} = useForm();
```

例子

```tsx
function App() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = data => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("username", { required: true })} />
      {errors.username && <span>必填</span>}

      <input type="submit" />
    </form>
  );
}
```

React不是受控组件模式，不会触发重渲染，因为大表格多次渲染会卡，只更新内部值性能更好

采用：

- ref + 原生表单事件（如input,blur
- 独立的状态存储（通过 Proxy 存储字段值，从而实现按需渲染

由于某个字段而re-render整个大表单是会消耗很多性能

所以 useForm 的设计理念就是尽量避免渲染

- 通过 register 把 DOM 事件（onChange/onBlur）接管，往内部 _formValues/_formState 里写；
- 再用 _subjects.watch/state/array 这套 **观察者模式** 把变更广播出去；
- useWatch / useFormState / useController 这些 Hook 在 React 侧用 useState + useEffect 订阅这些 subject，**只让真正订阅了的组件参与 Fiber 调度**；
- 普通 input 则完全用原生 DOM 维护，避免整表单受控带来的大量重渲染。