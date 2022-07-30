<script lang="tsx">
  import type { ContextMenuItem, ItemContentProps, Axis } from './typing';
  import type { FunctionalComponent, CSSProperties, PropType } from 'vue';
  import { defineComponent, nextTick, onMounted, computed, ref, unref, onUnmounted } from 'vue';
  import { Menu, Divider } from 'ant-design-vue';

  const prefixCls = 'context-menu';

  const props = {
    width: { type: Number, default: 156 },
    customEvent: { type: Object as PropType<Event>, default: null },
    styles: { type: Object as PropType<CSSProperties> },
    axis: {
      // The position of the right mouse button click
      type: Object as PropType<Axis>,
      default() {
        return { x: 0, y: 0 };
      },
    },
    items: {
      // The most important list, if not, will not be displayed
      type: Array as PropType<ContextMenuItem[]>,
      default() {
        return [];
      },
    },
  };

  const ItemContent: FunctionalComponent<ItemContentProps> = (props) => {
    const { item } = props;
    return (
      <span
        style="display: inline-block; width: 100%; "
        class="px-4"
        onClick={props.handler.bind(null, item)}
      >
        <span>{item.label}</span>
      </span>
    );
  };

  export default defineComponent({
    name: 'ContextMenu',
    props,
    setup(props) {
      const wrapRef = ref(null);
      const showRef = ref(false);

      const getStyle = computed((): CSSProperties => {
        const { axis, items, styles, width } = props;
        const { x, y } = axis || { x: 0, y: 0 };
        const menuHeight = (items || []).length * 40;
        const menuWidth = width;
        const body = document.body;

        const left = body.clientWidth < x + menuWidth ? x - menuWidth : x;
        const top = body.clientHeight < y + menuHeight ? y - menuHeight : y;
        return {
          ...styles,
          position: 'absolute',
          width: `${width}px`,
          left: `${left + 1}px`,
          top: `${top + 1}px`,
          zIndex: 9999,
          border: '1px solid rgb(0 0 0 / 8%)',
          boxShadow: '0 0 5px rgb(0 0 0 / 8%)',
        };
      });

      onMounted(() => {
        nextTick(() => (showRef.value = true));
      });

      onUnmounted(() => {
        const el = unref(wrapRef);
        el && document.body.removeChild(el);
      });

      function handleAction(item: ContextMenuItem, e: MouseEvent) {
        const { handler, disabled } = item;
        if (disabled) {
          return;
        }
        showRef.value = false;
        e?.stopPropagation();
        e?.preventDefault();
        handler?.();
      }

      function renderMenuItem(items: ContextMenuItem[]) {
        const visibleItems = items.filter((item) => !item.hidden);
        return visibleItems.map((item) => {
          const { disabled, label, children, divider = false } = item;

          const contentProps = {
            item,
            handler: handleAction,
          };

          if (!children || children.length === 0) {
            return (
              <>
                <Menu.Item disabled={disabled} class={`${prefixCls}__item`} key={label}>
                  <ItemContent {...contentProps} />
                </Menu.Item>
                {divider ? <Divider key={`d-${label}`} /> : null}
              </>
            );
          }
          if (!unref(showRef)) return null;

          return (
            <Menu.SubMenu key={label} disabled={disabled} popupClassName={`${prefixCls}__popup`}>
              {{
                title: () => <ItemContent {...contentProps} />,
                default: () => renderMenuItem(children),
              }}
            </Menu.SubMenu>
          );
        });
      }
      return () => {
        if (!unref(showRef)) {
          return null;
        }
        const { items } = props;
        return (
          <div class={prefixCls}>
            <Menu inlineIndent={12} mode="vertical" ref={wrapRef} style={unref(getStyle)}>
              {renderMenuItem(items)}
            </Menu>
          </div>
        );
      };
    },
  });
</script>
<style lang="less">
  .context-menu {
    &__item {
      margin: 0px !important;

      &:hover {
        background-color: #f5f5f5 !important;
      }
    }
  }
</style>
