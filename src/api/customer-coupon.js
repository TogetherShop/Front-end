import axios from '@/libs/axios'

// ���� ���� API �Լ���

/**
 * �߱� ������ ���� ��� ��ȸ
 * @param {Object} params - ���� �Ķ���� (���û���)
 * @param {string} params.storeGroup - ���� �׷� ����
 * @param {string} params.category - ī�װ� ����
 * @param {number} params.page - ������ ��ȣ
 * @param {number} params.limit - �������� ������ ��
 * @returns {Promise<Object>} ���� ��� ������
 */
export const getAvailableCoupons = async (params = {}) => {
  try {
    const response = await axios.get('/api/coupons/available', { params })
    return response.data
  } catch (error) {
    console.error('�߱� ������ ���� ��ȸ ����:', error)
    throw error
  }
}

/**
 * ���� ���� ��� ��ȸ
 * @param {Object} params - ���� �Ķ���� (���û���)
 * @param {string} params.search - �˻���
 * @param {string} params.status - ���� ���� (active, expired, used)
 * @param {number} params.page - ������ ��ȣ
 * @param {number} params.limit - �������� ������ ��
 * @returns {Promise<Object>} ���� ���� ��� ������
 */
export const getReceivedCoupons = async (params = {}) => {
  try {
    const response = await axios.get('/api/coupons/received', { params })
    return response.data
  } catch (error) {
    console.error('���� ���� ��ȸ ����:', error)
    throw error
  }
}

/**
 * ���� �߱� ��û
 * @param {number} couponId - ���� ID
 * @returns {Promise<Object>} �߱� ���
 */
export const claimCoupon = async (couponId) => {
  try {
    const response = await axios.post(`/api/coupons/${couponId}/claim`)
    return response.data
  } catch (error) {
    console.error(`���� �߱� ���� (ID: ${couponId}):`, error)
    throw error
  }
}

/**
 * ���� ���
 * @param {number} couponId - ���� ID
 * @param {Object} data - ��� ������ (���û���)
 * @param {string} data.storeId - ��� ���� ID
 * @param {number} data.amount - ��� �ݾ�
 * @returns {Promise<Object>} ��� ���
 */
export const useCoupon = async (couponId, data = {}) => {
  try {
    const response = await axios.post(`/api/coupons/${couponId}/use`, data)
    return response.data
  } catch (error) {
    console.error(`���� ��� ���� (ID: ${couponId}):`, error)
    throw error
  }
}

/**
 * ���� �� ���� ��ȸ
 * @param {number} couponId - ���� ID
 * @returns {Promise<Object>} ���� �� ����
 */
export const getCouponDetail = async (couponId) => {
  try {
    const response = await axios.get(`/api/coupons/${couponId}`)
    return response.data
  } catch (error) {
    console.error(`���� �� ���� ��ȸ ���� (ID: ${couponId}):`, error)
    throw error
  }
}

/**
 * ���� ��� ���� ���� Ȯ��
 * @param {number} couponId - ���� ID
 * @param {Object} data - Ȯ�� ������
 * @param {string} data.storeId - ���� ID
 * @param {number} data.amount - �ֹ� �ݾ�
 * @returns {Promise<Object>} ��� ���� ����
 */
export const checkCouponAvailability = async (couponId, data) => {
  try {
    const response = await axios.post(`/api/coupons/${couponId}/check`, data)
    return response.data
  } catch (error) {
    console.error(`���� ��� ���� ���� Ȯ�� ���� (ID: ${couponId}):`, error)
    throw error
  }
}

/**
 * ���� �����丮 ��ȸ
 * @param {Object} params - ���� �Ķ����
 * @param {string} params.type - �����丮 Ÿ�� (claim, use, expire)
 * @param {string} params.startDate - ���� ��¥
 * @param {string} params.endDate - ���� ��¥
 * @param {number} params.page - ������ ��ȣ
 * @param {number} params.limit - �������� ������ ��
 * @returns {Promise<Object>} ���� �����丮 ������
 */
export const getCouponHistory = async (params = {}) => {
  try {
    const response = await axios.get('/api/coupons/history', { params })
    return response.data
  } catch (error) {
    console.error('���� �����丮 ��ȸ ����:', error)
    throw error
  }
}

/**
 * ���� ��� ��ȸ
 * @returns {Promise<Object>} ���� ��� ������
 */
export const getCouponStats = async () => {
  try {
    const response = await axios.get('/api/coupons/stats')
    return response.data
  } catch (error) {
    console.error('���� ��� ��ȸ ����:', error)
    throw error
  }
}
