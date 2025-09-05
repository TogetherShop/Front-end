<template>
  <div class="tab-bar-container sticky-bottom bg-white border-top">
    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col" v-for="tab in tabs" :key="tab.name">
          <router-link
            :to="tab.route"
            class="tab-item d-flex flex-column align-items-center py-3 text-decoration-none"
            :class="{ active: isActive(tab.route) }"
          >
            <span class="material-symbols-outlined mb-1 tab-icon">
              {{ tab.icon }}
            </span>

            <small class="tab-label">
              {{ tab.label }}
            </small>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BusinessBottomNavigation',
  data() {
    return {
      tabs: [
        {
          name: 'Home',
          route: '/business',
          icon: 'home',
          label: '홈',
        },
        {
          name: 'StoreList',
          route: '/business/stores',
          icon: 'handshake',
          label: '제휴',
        },
        {
          name: 'CouponList',
          route: '/business/coupons',
          icon: 'redeem',
          label: '쿠폰',
        },
        {
          name: 'GroupBuy',
          route: '/business/group-buy',
          icon: 'groups',
          label: '공동구매',
        },
        {
          name: 'Profile',
          route: '/business/profile',
          icon: 'person',
          label: '내정보',
        },
      ],
    }
  },
  methods: {
    isActive(route) {
      return this.$route.path === route
    },
  },
}
</script>

<style scoped>
.tab-item {
  color: #6f797a;
  transition: color 0.2s ease;
  padding: 8px 4px;
}

.tab-item.active {
  color: #017f58;
}

.tab-item.active .tab-icon,
.tab-item.active .tab-label {
  color: #017f58;
}

.tab-icon {
  font-size: 24px;
  font-weight: 400;
}

.tab-label {
  font-size: 0.75rem;
  font-weight: 600;
}

.border-top {
  border-color: var(--bs-gray-200, #e9ecef) !important;
}
</style>
