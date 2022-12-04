import { type PropType, defineComponent } from 'vue'
import { IxTooltip } from '@idux/components/tooltip'

export default defineComponent({
  props: {
    prefixCls: { type: String, required: true },
    tooltip: String,
    onClick: { type: Function as PropType<() => void>, required: true },
  },
  setup(props, { slots }) {
    return () => (
      <IxTooltip title={props.tooltip}>
        <div class={`${props.prefixCls}-demo__tool`} onClick={props.onClick}>
          {slots.default?.()}
        </div>
      </IxTooltip>
    )
  },
})
