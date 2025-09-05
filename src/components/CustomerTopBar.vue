<template>
  <header class="top-bar bg-white">
    <div class="container-fluid px-3 py-2">
      <div class="row align-items-center">
        <div class="col-6 d-flex align-items-center">
          <img 
            src="@/assets/images/togethershop_logo.png" 
            alt="Togethershop Logo" 
            class="top-bar__logo"
          />
        </div>
        <div class="col-6 d-flex justify-content-end">
          <i class="material-symbols-outlined fs-2">notifications</i>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'TopBar'
}
</script>

<style>
@import '../styles/customer-top-bar.css';
</style>
