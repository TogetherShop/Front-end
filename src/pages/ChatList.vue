<template>
  <div class="screen">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="arrow-back-ios">←</div>
        <div class="title">제휴 채팅</div>
      </div>

      <!-- Search Box -->
      <div class="search-container">
        <div class="search-box">
          <div class="search-icon">
            <div class="search-icon-inner">
              <div class="search-circle"></div>
              <div class="search-handle"></div>
            </div>
          </div>
          <div class="search-text">매장명 검색</div>
        </div>
      </div>

      <!-- Filter Buttons -->
      <div class="filter-buttons">
        <div
          v-for="filter in ['전체', '대기', '협의중', '협의완료', '거절']"
          :key="filter"
          class="filter-button"
          :class="{ active: selectedFilter === filter }"
          @click="selectFilter(filter)"
        >
          <div class="filter-text">{{ filter }}</div>
        </div>
      </div>

      <!-- Chat List -->
      <div class="chat-list">
        <!-- 달콤 베이커리 -->
        <div class="chat-item">
          <div class="chat-header">
            <div class="store-name-container">
              <div class="store-name">달콤 베이커리</div>
              <div class="store-info">
                <div class="online-status">오프라인</div>
                <div class="rating">
                  <div class="star">★</div>
                  <div class="rating-score">4.8</div>
                </div>
              </div>
            </div>

            <div class="status-badge negotiating">
              <div class="status-text">협의중</div>
            </div>
          </div>
          <div class="store-category">베이커리</div>
          <div class="message-container">
            <div class="message">
              <div class="message-text">15% 할인으로 조정 가능할까요?</div>
            </div>
            <div class="time-badge">
              <div class="time-background"></div>
              <div class="time-text">2분 전</div>
            </div>
          </div>
        </div>

        <!-- 행복한 꽃집 -->
        <div class="chat-item">
          <div class="chat-header">
            <div class="store-name-container">
              <div class="store-name">행복한 꽃집</div>
              <div class="store-info">
                <div class="online-status">오프라인</div>
                <div class="rating">
                  <div class="star">★</div>
                  <div class="rating-score">4.9</div>
                </div>
              </div>
            </div>
            <div class="status-badge completed">
              <div class="status-text">협의완료</div>
            </div>
          </div>
          <div class="store-category">꽃집</div>
          <div class="message-container">
            <div class="message">
              <div class="message-text">제휴 조건에 동의합니다~</div>
            </div>
            <div class="time-badge">
              <div class="time-text">1시간 전</div>
            </div>
          </div>
        </div>

        <!-- 맛있는 피자 -->
        <div class="chat-item">
          <div class="chat-header">
            <div class="store-name-container">
              <div class="store-name">맛있는 피자</div>
              <div class="store-info">
                <div class="online-status">오프라인</div>
                <div class="rating">
                  <div class="star">★</div>
                  <div class="rating-score">3.9</div>
                </div>
              </div>
            </div>
            <div class="status-badge rejected">
              <div class="status-text">거절</div>
            </div>
          </div>
          <div class="store-category">음식점</div>
          <div class="message-container">
            <div class="message">
              <div class="message-text">죄송하지만 이번엔 어려울 것 `~~`.~~~~~~~~~~₩</div>
            </div>
            <div class="time-badge">
              <div class="time-text">3시간 전</div>
            </div>
          </div>
          <div class="store-info">
            <div class="rating">
              <div class="rating-score">3.9</div>
              <div class="star">★</div>
            </div>
            <div class="online-status">오프라인</div>
          </div>
        </div>

        <!-- 스타일 헤어샵 -->
        <div class="chat-item">
          <div class="chat-header">
            <div class="store-name-container">
              <div class="store-name">스타일 헤어샵</div>
              <div class="store-info">
                <div class="online-status">오프라인</div>
                <div class="rating">
                  <div class="star">★</div>
                  <div class="rating-score">4.6</div>
                </div>
              </div>
            </div>
            <div class="status-badge waiting">
              <div class="status-text">대기</div>
            </div>
          </div>
          <div class="store-category">음식점</div>
          <div class="message-container">
            <div class="message">
              <div class="message-text">요청이 들어왔습니다.</div>
            </div>
            <div class="time-badge">
              <div class="time-background"></div>
              <div class="time-text">30분 전</div>
            </div>
          </div>
          <div class="store-info">
            <div class="rating">
              <div class="rating-score">4.6</div>
              <div class="star">★</div>
            </div>
            <div class="online-status">오프라인</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 선택된 필터 상태
const selectedFilter = ref('전체')

// 필터 버튼 클릭 핸들러
const selectFilter = (filter) => {
  selectedFilter.value = filter
}
</script>

<style scoped>
.screen {
  align-items: start;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  width: 100vw;
  min-height: 100vh;
}

.container {
  background-color: #ffffff;
  width: 390px;
  min-height: 1082px;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  padding: 22px 20px;
  gap: 12px;
}

.arrow-back-ios {
  width: 20px;
  height: 20px;
  font-size: 16px;
  color: #000000;
  cursor: pointer;
}

.title {
  color: #000000;
  font-family: 'Pretendard-Medium', Helvetica;
  font-size: 20px;
  font-weight: 500;
  line-height: 27px;
  text-align: center;
}

/* Search Container */
.search-container {
  padding: 0 20px;
  margin-bottom: 16px;
}

.search-box {
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #f8f8f8;
  border-radius: 5px;
  box-shadow: 0px 1px 2px #0000001a;
  height: 41px;
  display: flex;
  align-items: center;
  padding: 0 17px;
  gap: 10px;
}

.search-icon {
  width: 16px;
  height: 16px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon-inner {
  position: relative;
  width: 13px;
  height: 13px;
}

.search-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
  border: 1px solid #666;
  border-radius: 50%;
}

.search-handle {
  position: absolute;
  top: 9px;
  left: 9px;
  width: 4px;
  height: 4px;
  background-color: #666;
  transform: rotate(45deg);
}

.search-text {
  color: var(--);
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 15px;
  font-weight: 400;
  line-height: normal;
}

/* Filter Buttons */
.filter-buttons {
  display: flex;
  gap: 8px;
  padding: 0 20px;
  margin-bottom: 30px;
}

.filter-button.active .filter-text {
  background-color: var(--);
  border-color: #f0fdf4;
  color: #ffffff;
}
.filter-button .filter-text {
  background-color: #ffffff; /* 기본 흰색 */
  border: 1px solid #f8f8f8;
  border-radius: 5px;
  box-shadow: 0px 1px 2px #0000001a;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  color: #000;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;
}

/* 선택된 버튼 */
.filter-button.active .filter-text {
  background-color: #017f58;
  color: #ffffff;
  border: 1px solid #017f58;
}

/* Chat List */
.chat-list {
  flex: 1;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chat-item {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.08);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.store-name-container {
  display: flex;
  align-items: center;
  gap: 8px; /* 이름과 평점/오프라인 사이 간격 */
}
.store-name {
  font-family: 'Pretendard-Medium', Helvetica;
  font-size: 16px;
  font-weight: 600;
  color: #000000;
}

.status-badge {
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.negotiating {
  background-color: #e6f0ff;
  color: #1e64ff;
}

.status-badge.completed {
  background-color: #e9f7ef;
  color: #28a745;
}

.status-badge.rejected {
  background-color: #fdecea;
  color: #dc3545;
}

.status-badge.waiting {
  background-color: #f1f3f5;
  color: #495057;
}

.status-text {
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  color: #000000;
}

.store-category {
  font-size: 13px;
  color: #777;
}
.message-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.message {
  flex: 1;
  border-radius: 8px;
  margin-right: 10px;
  min-width: 0px;
}

.message-text {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.time-badge::before {
  content: '●';
  color: #e63946; /* 빨간 점 */
  font-size: 10px;
}

.time-text {
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  color: #666666;
  white-space: nowrap;
}

.store-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
}

.rating-score {
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  color: #666666;
}

.star {
  color: #ffd700;
  font-size: 14px;
}

.online-status {
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  color: #666666;
}
</style>
