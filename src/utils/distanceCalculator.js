/**
 * 거리 계산 유틸리티
 * Haversine 공식을 사용하여 두 지점 간의 거리를 계산합니다.
 */

/**
 * 두 지점 간의 거리를 계산 (km 단위)
 * @param {number} lat1 - 첫 번째 지점의 위도
 * @param {number} lng1 - 첫 번째 지점의 경도  
 * @param {number} lat2 - 두 번째 지점의 위도
 * @param {number} lng2 - 두 번째 지점의 경도
 * @returns {number} 두 지점 간의 거리 (km)
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  // 입력값 검증
  if (!isValidCoordinate(lat1, lng1) || !isValidCoordinate(lat2, lng2)) {
    return null
  }

  const R = 6371 // 지구의 반지름 (km)
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 100) / 100 // 소수점 둘째 자리까지 반올림
}

/**
 * 도(degree)를 라디안(radian)으로 변환
 * @param {number} degrees 
 * @returns {number}
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180)
}

/**
 * 좌표값이 유효한지 검증
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {boolean}
 */
const isValidCoordinate = (lat, lng) => {
  return typeof lat === 'number' && typeof lng === 'number' &&
         lat >= -90 && lat <= 90 &&
         lng >= -180 && lng <= 180 &&
         !isNaN(lat) && !isNaN(lng)
}

/**
 * 거리에 따른 표시 형식
 * @param {number} distance - 거리 (km)
 * @returns {string} 포맷된 거리 문자열
 */
export const formatDistance = (distance) => {
  if (distance === null || distance === undefined) {
    return '거리 정보 없음'
  }
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  } else if (distance < 10) {
    return `${distance}km`
  } else {
    return `${Math.round(distance)}km`
  }
}
