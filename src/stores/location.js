import { defineStore } from 'pinia'
import { waitKakaoReady } from '@/utils/waitKakaoReady'

export const useLocationStore = defineStore('location', {
  state: () => ({
    currentLocation: {
      latitude: null,
      longitude: null,
      address: '',
    },
    isLocationLoading: false,
    locationError: null,
  }),

  getters: {
    hasValidLocation: (state) => {
      return state.currentLocation.latitude !== null && state.currentLocation.longitude !== null
    },

    locationString: (state) => {
      if (!state.currentLocation.address) return '위치 정보 없음'
      return state.currentLocation.address
    },
  },

  actions: {
    async getCurrentLocation() {
      this.isLocationLoading = true
      this.locationError = null

      try {
        if (!navigator.geolocation) {
          throw new Error('이 브라우저에서는 위치 정보를 지원하지 않습니다')
        }

        const position = await this.getGeolocationPosition()

        const address = await this.getAddressFromCoords(
          position.coords.latitude,
          position.coords.longitude,
        )

        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: address,
        }

        return this.currentLocation
      } catch (error) {
        console.error('위치 정보를 가져오는데 실패했습니다:', error)
        this.locationError = error.message

        // 기본 위치 설정 (서울 강남구)
        this.setDefaultLocation()

        // 에러가 발생해도 기본 위치로 계속 진행
        return this.currentLocation
      } finally {
        this.isLocationLoading = false
      }
    },

    getGeolocationPosition() {
      return new Promise((resolve, reject) => {
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            let errorMessage = '위치 정보를 가져올 수 없습니다'

            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = '위치 정보 접근이 거부되었습니다'
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = '위치 정보를 사용할 수 없습니다'
                break
              case error.TIMEOUT:
                errorMessage = '위치 정보 요청 시간이 초과되었습니다'
                break
              default:
                errorMessage = '알 수 없는 오류가 발생했습니다'
                break
            }

            reject(new Error(errorMessage))
          },
          options,
        )
      })
    },

    async getAddressFromCoords(lat, lng) {
      try {
        await waitKakaoReady()

        return new Promise((resolve) => {
          const geocoder = new kakao.maps.services.Geocoder()

          geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
              const address = result[0]?.address
              if (address) {
                // 시/도 + 시/군/구 형태로 반환
                const region1 = address.region_1depth_name || ''
                const region2 = address.region_2depth_name || ''
                const region3 = address.region_3depth_name || ''

                let fullAddress = ''
                if (region1) fullAddress += region1
                if (region2) fullAddress += (fullAddress ? ' ' : '') + region2
                if (region3) fullAddress += (fullAddress ? ' ' : '') + region3

                resolve(fullAddress || '현재 위치')
              } else {
                resolve('현재 위치')
              }
            } else {
              console.warn('주소 변환 실패:', status)
              resolve(this.getApproximateAddress(lat, lng))
            }
          })
        })
      } catch (error) {
        console.error('주소 변환 오류:', error)
        return this.getApproximateAddress(lat, lng)
      }
    },

    getApproximateAddress(lat, lng) {
      // 서울 지역 대략적인 판단 (임시)
      if (lat >= 37.4 && lat <= 37.7 && lng >= 126.8 && lng <= 127.2) {
        if (lat > 37.55) {
          return '서울특별시 강북 지역'
        } else {
          return '서울특별시 강남 지역'
        }
      }

      // 기타 주요 도시 판단
      if (lat >= 37.2 && lat <= 37.4 && lng >= 126.9 && lng <= 127.2) {
        return '경기도 성남/수원 지역'
      }
      if (lat >= 35.1 && lat <= 35.2 && lng >= 129.0 && lng <= 129.1) {
        return '부산광역시'
      }
      if (lat >= 35.8 && lat <= 35.9 && lng >= 128.5 && lng <= 128.7) {
        return '대구광역시'
      }

      return '현재 위치'
    },

    setDefaultLocation() {
      this.currentLocation = {
        latitude: 37.5173,
        longitude: 127.0473,
        address: '서울특별시 강남구',
      }
    },

    setCustomLocation(latitude, longitude, address = '') {
      this.currentLocation = {
        latitude,
        longitude,
        address: address || '사용자 지정 위치',
      }
      this.locationError = null
    },

    clearLocation() {
      this.currentLocation = {
        latitude: null,
        longitude: null,
        address: '',
      }
      this.locationError = null
    },

    clearError() {
      this.locationError = null
    },

    // 특정 주소를 좌표로 변환 (검색 기능용)
    async getCoordinatesFromAddress(address) {
      try {
        await waitKakaoReady()
        return new Promise((resolve, reject) => {
          const geocoder = new kakao.maps.services.Geocoder()

          geocoder.addressSearch(address, (result, status) => {
            if (status === kakao.maps.services.Status.OK && result.length > 0) {
              const coords = {
                latitude: parseFloat(result[0].y),
                longitude: parseFloat(result[0].x),
                address: result[0].address_name,
              }
              resolve(coords)
            } else {
              reject(new Error('주소를 찾을 수 없습니다'))
            }
          })
        })
      } catch (error) {
        console.error('주소 검색 실패:', error)
        throw error
      }
    },

    // 키워드로 장소 검색
    async searchPlaces(keyword) {
      try {
        await waitKakaoReady()
        return new Promise((resolve, reject) => {
          const places = new kakao.maps.services.Places()

          const searchOption = {
            location: this.hasValidLocation
              ? new kakao.maps.LatLng(this.currentLocation.latitude, this.currentLocation.longitude)
              : new kakao.maps.LatLng(37.5173, 127.0473),
            radius: 5000, // 5km 반경
            sort: kakao.maps.services.SortBy.DISTANCE,
          }

          places.keywordSearch(
            keyword,
            (result, status) => {
              if (status === kakao.maps.services.Status.OK) {
                const places = result.map((place) => ({
                  id: place.id,
                  name: place.place_name,
                  address: place.address_name,
                  roadAddress: place.road_address_name,
                  latitude: parseFloat(place.y),
                  longitude: parseFloat(place.x),
                  category: place.category_group_name,
                  phone: place.phone,
                  distance: place.distance,
                }))
                resolve(places)
              } else {
                reject(new Error('검색 결과가 없습니다'))
              }
            },
            searchOption,
          )
        })
      } catch (error) {
        console.error('장소 검색 실패:', error)
        throw error
      }
    },
  },
})
