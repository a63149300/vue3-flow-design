<template>
  <div style="height: 100%;">
    <a-layout class="container">
      <a-layout-sider width="44" theme="light" class="select-area">
        <a-row>
          <div class="tab">基础</div>

        </a-row>
        <a-row>
          <div class="tab">高级</div>

        </a-row>
        <a-row>
          <div class="tab">泳道</div>

        </a-row>
      </a-layout-sider>
      <a-layout>
        <a-layout-header class="header-option">
          <div class="header-option__tools">
          
          </div>
          <div class="header-option__buttons">
            <a-tooltip title="保存流程" placement="bottom">
              <a-button
                @click="null"
                class="header-option-button"
                size="small"
                icon="save"
              ></a-button>
            </a-tooltip>
            <a-tooltip title="生成流程图片" placement="bottom">
              <a-button
                @click="null"
                class="header-option-button"
                size="small"
                icon="picture"
              ></a-button>
            </a-tooltip>
            <a-popconfirm
              title="确认要重新绘制吗？"
              placement="bottom"
              okText="确认"
              cancelText="取消"
              @confirm="null"
            >
              <a-tooltip title="重新绘制" placement="bottom">
                <a-button
                  class="header-option-button"
                  size="small"
                  icon="delete"
                ></a-button>
              </a-tooltip>
            </a-popconfirm>
            <a-tooltip :title="111" placement="bottom">
              <a-button
                @click="null"
                class="header-option-button"
                size="small"
              >
              </a-button>
            </a-tooltip>
            <a-tooltip title="设置" placement="bottom">
              <a-button
                @click="null"
                class="header-option-button"
                size="small"
                icon="setting"
              ></a-button>
            </a-tooltip>
            <a-tooltip title="测试" placement="bottom">
              <a-button
                @click="null"
                class="header-option-button"
                size="small"
                icon="tool"
              ></a-button>
            </a-tooltip>
            <a-popconfirm
              title="请选择帮助项："
              placement="bottom"
              okType="default"
              okText="快捷键大全"
              cancelText="使用文档"
              @confirm="null"
              @cancel="null"
            >
              <a-tooltip title="帮助" placement="bottom">
                <a-button
                  class="header-option-button"
                  size="small"
                  icon="book"
                ></a-button>
              </a-tooltip>
            </a-popconfirm>
            <a-tooltip title="退出" placement="bottom">
              <a-button
                @click="null"
                class="header-option-button"
                size="small"
                icon="logout"
              ></a-button>
            </a-tooltip>
          </div>
        </a-layout-header>
        <a-layout-content class="content">
        </a-layout-content>
        <a-layout-footer class="foot">
          <span>VFDP , Powered by </span>
        </a-layout-footer>
      </a-layout>
      <a-layout-sider
        width="250"
        theme="light"
        class="attr-area"
        @mousedown.stop="null"
      >
      </a-layout-sider>
    </a-layout>
    
  </div>
</template>

<script lang="ts" setup>
import jsplumb from "jsplumb";

</script>

<style lang="less">
@import "./style/flow-designer.less";

.node-img {
  width: 14px;
  height: 14px;
  margin-right: 10px;
}
</style>
