<script setup>
import { RouterView } from 'vue-router'
import intlHeader from './components/IntlHeader.vue'

</script>

<template>
  <div class="container">
    <intlHeader />
    <RouterView> </RouterView>
  </div>
</template>

<style lang="scss">
.container {
  position: relative;
  width: 100vw;
  min-height: calc(100dvh - $ea-header-height);
  margin-top: $ea-header-height;
  font-family: "Microsoft YaHei", sans-serif;
}
.fade-enter-active {
  transition: opacity 0.1s;
}

.fade-leave-active {
  transition: opacity 0.1s;
  display: none;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/**Page with inner-box */
.page-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100dvh - $ea-header-height);
  background-color: ea-dark(1);
}

.inner-box {
  position: relative;
  height: 80dvh;
  width: 80vw;
  box-shadow: $shadow-1;
  border-radius: 10px;
  background-color: $ea-white;
  padding-top: $ea-nav-height;
  overflow: hidden;
}
.nav-box {
  position: absolute;
  top: 0;
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: $ea-nav-height;
  border-bottom: ea-gray(10) 1px solid;
  font-size: 14px;
  box-sizing: border-box;

  .nav {
    display: flex;

    &.nav-right {
      margin-left: auto;
    }
  }

  .nav-item {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 0 12px;
    cursor: pointer;

    .nav-text {
      margin-left: 4px;
    }

    &:hover {
      background-color: ea-main(2);
    }
  }
}

@media (max-width: 900px) {

  .page-box {
    height: 100% !important;
    width: 100% !important;
    flex-direction: column !important;
    border-radius: 0 !important;
    box-sizing: border-box !important;
    padding-top: 0 !important;
  }

  .nav-box {
    position: relative;
    top: 0;
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: $ea-nav-height-m;
    border-bottom: ea-gray(10) 1px solid;
    font-size: 14px;
    box-sizing: border-box;

    .nav-right {
      margin-left: auto;
    }

    .nav-item {
      display: flex;
      height: 100%;
      align-items: center;
      padding: 0 12px;
      cursor: pointer;

      .nav-text {
        margin-left: 4px;
      }

      &:hover {
        background-color: ea-main(2);
      }
    }
  }
}

/* scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  border-radius: 8px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  background: ea-main(2);
  transition: all 0.2s;
}

::-webkit-scrollbar-thumb:hover {
  background-color: ea-main(4);
}

::-webkit-scrollbar-track {
  background: #fff;
}
</style>
