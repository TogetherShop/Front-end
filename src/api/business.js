import api from './api'

export async function fetchHomeSummary() {
  const { data } = await api.get('/api/business/home-summary')
  return data
}

export async function fetchHomeSummaryOpen(username) {
  const { data } = await api.get('/api/business/home-summary-open', {
    params: { username },
  })
  return data
}

export async function fetchProfileSummary() {
  const { data } = await api.get('/api/business/profile-summary')
  return data
}
