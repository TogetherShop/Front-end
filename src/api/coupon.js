import axios from '@/libs/axios'

// ���� ���� API �Լ���

/**
 * �߱� ������ ���� ��� ��ȸ
 * @returns {Promise} ���� ��� ������
 */
export const getAvailableCoupons = async () => {
  try {
    const response = await axios.get('/api/coupons/available')
    return response.data
  } catch (error) {
    console.error('�߱� ������ ���� ��ȸ ����:', error)
    throw error
  }
}

/**
 * ���� ���� ��� ��ȸ
 * @returns {Promise} ���� ���� ��� ������
 */
export const getReceivedCoupons = async () => {
  try {
    const response = await axios.get('/api/coupons/received')
    return response.data
  } catch (error) {
    console.error('���� ���� ��ȸ ����:', error)
    throw error
  }
}

/**
 * ���� �߱� ��û
 * @param {number} couponId - ���� ID
 * @returns {Promise} �߱� ���
 */
export const claimCoupon = async (couponId) => {
  try {
    const response = await axios.post(`/api/coupons/${couponId}/claim`)
    return response.data
  } catch (error) {
    console.error('���� �߱� ����:', error)
    throw error
  }
}

/**
 * ���� ���
 * @param {number} couponId - ���� ID
 * @returns {Promise} ��� ���
 */
export const useCoupon = async (couponId) => {
  try {
    const response = await axios.post(`/api/coupons/${couponId}/use`)
    return response.data
  } catch (error) {
    console.error('���� ��� ����:', error)
    throw error
  }
}
