<template>
  <a-layout-footer class="flow-footer">
    <span>Vue3-Flow-Design, Powered by 前端爱码士</span>
    <a-tooltip title="GIT地址" placement="top">
      <a-button @click="goGit" type="link" size="small">
        <template #icon>
          <component :is="'GithubOutlined'" />
        </template>
      </a-button>
    </a-tooltip>
  </a-layout-footer>
</template>
<script lang="ts" setup>
  // GIT地址
  function goGit() {
    window.open('https://gitee.com/zhangyeping/vue3-flow-design');
  }
</script>
