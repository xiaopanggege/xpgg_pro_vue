<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <el-tooltip :content="name" placement="left-start" effect="light">
          <div class="avatar-wrapper link-type">
            
            <img :src="avatar" class="user-avatar">
            <!-- <span class="avatar-name">{{ name }}</span> -->
            <i class="el-icon-caret-bottom" />
            
          </div>
        </el-tooltip>
        
        <!-- </a> -->
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <!-- <el-dropdown-item>
            <span class="avatar-name" >个人中心</span>
          </el-dropdown-item> -->
          <router-link to="/system/userinfo">
            <el-dropdown-item>
              个人中心
            </el-dropdown-item>
          </router-link>
          <router-link to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <a target="_blank" href="https://github.com/xiaopanggege/xpgg_pro">
            <el-dropdown-item>项目地址</el-dropdown-item>
          </a>
          <a target="_blank" href="https://github.com/xiaopanggege/xpgg_pro">
            <el-dropdown-item>Docs</el-dropdown-item>
          </a>
          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)  //跳转回login
      // 原来是直接跳转会对接的cas单点登录页，但是现在我把cas单点登录作为第三方登录所以现在重新跳回自己的登录页，在自己登录页上面有第三方登录按钮
      // window.location.href = `https://sid.ruijie.com.cn/logout?service=http://yfxpgg.ruijie.com.cn/dashboard`
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        // .avatar-name {
        //   position: relative;
        //   // right: -20px;
        //   bottom: 15px;
        //   font-size: 14px;
        // }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
