<template>
  <div class="screen">
    <div class="div-2">
      <!-- 헤더 -->
      <div class="header">
        <ArrowBackIos class="arrow-back-ios" />
        <div class="text-wrapper-28">제휴 채팅</div>
      </div>

      <!-- 스크롤 가능한 메인 컨텐츠 -->
      <div class="scrollable-content">
        <!-- 검색 섹션 -->
        <div class="search-section">
          <div class="view-5">
            <div class="overlap-6">
              <div class="SVG">
                <div class="overlap-group-3">
                  <img class="vector" alt="Vector" :src="vector" />
                  <img class="vector-2" alt="Vector" :src="image" />
                </div>
              </div>
              <div class="text-wrapper-33">매장명 검색</div>
            </div>
          </div>
        </div>

        <!-- 필터 탭 섹션 -->
        <div class="filter-tabs">
          <div class="tab-item active">
            <div class="overlap-group-2">
              <div class="text-wrapper-29">전체</div>
            </div>
          </div>
          <div class="tab-item">
            <div class="overlap-4">
              <div class="text-wrapper-31">대기</div>
            </div>
          </div>
          <div class="tab-item">
            <div class="overlap-5">
              <div class="text-wrapper-32">협의중</div>
            </div>
          </div>
          <div class="tab-item">
            <div class="overlap-3">
              <div class="text-wrapper-30">협의완료</div>
            </div>
          </div>
          <div class="tab-item">
            <div class="overlap-4">
              <div class="text-wrapper-31">거절</div>
            </div>
          </div>
        </div>

        <!-- 채팅 리스트 섹션 -->
        <div class="chat-list">
          <ViewSubsection />
          <LinkSubsection />
          <LinkWrapperSubsection />
          <DivWrapperSubsection />
          <DivSubsection />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.screen {
  align-items: start;
  background-color: #ffffff;
  display: grid;
  justify-items: center;
  width: 100vw;
}

.screen .div-2 {
  background-color: #ffffff;
  width: 390px;
  min-height: 844px;
  display: flex;
  flex-direction: column;
  font-family: 'Pretendard', Helvetica, sans-serif;
}

/* 헤더 */
.screen .header {
  width: 100%;
  height: 68px;
  display: flex;
  align-items: center;
  padding: 24px 22px;
  box-sizing: border-box;
  flex-shrink: 0;
  position: relative;
}

.screen .arrow-back-ios {
  height: 20px !important;
  width: 20px !important;
}

.screen .text-wrapper-28 {
  color: #000000;
  font-family: 'Pretendard-Medium', Helvetica;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 27px;
  white-space: nowrap;
  margin-left: 10px;
}

/* 스크롤 가능한 메인 컨텐츠 */
.screen .scrollable-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px 20px 20px;
}

.screen .scrollable-content::-webkit-scrollbar {
  display: none;
  width: 0;
}

/* 검색 섹션 */
.screen .search-section {
  width: 100%;
  margin-top: 5px;
}

.screen .view-5 {
  width: 100%;
  max-width: 354px;
}

.screen .overlap-6 {
  background-color: #ffffff;
  border: 1px solid #f8f8f8;
  border-radius: 5px;
  box-shadow: 0px 1px 2px #0000001a;
  height: 41px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 17px;
  box-sizing: border-box;
  gap: 26px;
}

.screen .SVG {
  border-radius: 5px;
  height: 16px;
  width: 16px;
  flex-shrink: 0;
}

.screen .overlap-group-3 {
  height: 13px;
  width: 13px;
  position: relative;
  margin: 1px;
}

.screen .vector {
  height: 12px;
  width: 12px;
  position: absolute;
}

.screen .vector-2 {
  height: 4px;
  width: 4px;
  position: absolute;
  right: 0;
  bottom: 0;
}

.screen .text-wrapper-33 {
  color: var(--);
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: normal;
  white-space: nowrap;
}

/* 필터 탭 섹션 */
.screen .filter-tabs {
  width: 100%;
  display: flex;
  gap: 13px;
  flex-wrap: wrap;
}

.screen .tab-item {
  flex-shrink: 0;
}

.screen .overlap-group-2,
.screen .overlap-3,
.screen .overlap-4,
.screen .overlap-5 {
  border: 1px solid #f8f8f8;
  border-radius: 5px;
  box-shadow: 0px 1px 2px #0000001a;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  box-sizing: border-box;
  cursor: pointer;
}

.screen .overlap-group-2 {
  background-color: var(--);
  border-color: #f0fdf4;
  min-width: 55px;
}

.screen .overlap-3 {
  background-color: #ffffff;
  min-width: 65px;
}

.screen .overlap-4 {
  background-color: #ffffff;
  min-width: 55px;
}

.screen .overlap-5 {
  background-color: #ffffff;
  min-width: 60px;
}

.screen .text-wrapper-29 {
  color: #ffffff;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 16px;
  text-align: center;
  white-space: nowrap;
}

.screen .text-wrapper-30,
.screen .text-wrapper-31,
.screen .text-wrapper-32 {
  color: var(--);
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 16px;
  text-align: center;
  white-space: nowrap;
}

/* 채팅 리스트 섹션 */
.screen .chat-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}
</style>
