<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo">
        <h1 v-else class="sidebar-title">{{ title }} </h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo">
        <h1 class="sidebar-title">{{ title }} </h1>
      </router-link>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      title: '小胖运维系统',
      // 如果是网络上面的logo那直接写logo:'https://wpimg.wallstcn.com/69a1c46c-eb1c-4b46-8bd4-e9e686ef5251.png' 即可
      // 因为是引用静态文件里的必须用require
      logo: require('@/assets/sidebar-logo/sidebar-log.png')
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: #002140;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 8px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: 600;
      line-height: 50px;
      font-size: 19px;
      // font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      font-family: Avenir, Helvetica Neue, KaiTi;
      vertical-align: middle;
      background-image: -webkit-linear-gradient(left, #2ff, rgb(221, 128, 66) 25%, #2ff 50%, rgb(221, 128, 66) 75%, #2ff);
      -webkit-text-fill-color: transparent;
      -webkit-background-clip: text;
      -webkit-background-size: 200% 100%;
      -webkit-animation:  maskedAnimation 7s infinite linear;

      }
      
    @keyframes maskedAnimation {
      0% {
        background-position: 0 0;
      }
      100% {
          background-position: -100% 0;
      }
    }

  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
