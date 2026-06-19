import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'

export const SET_LOADING = 'SET_LOADING'
export const SET_IMAGES = 'SET_IMAGES'
export const SET_ERROR = 'SET_ERROR'
export const SET_FILTERS = 'SET_FILTERS'
export const SELECT_IMAGE = 'SELECT_IMAGE'
export const CLEAR_SELECTION = 'CLEAR_SELECTION'
export const NEXT_PAGE = 'NEXT_PAGE'
export const PREV_PAGE = 'PREV_PAGE'
export const SET_USER = 'SET_USER'
export const LOGOUT = 'LOGOUT'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const initialState = {
  images: [],
  total: 0,
  loading: false,
  error: null,
  filters: { width: 300, height: 300, page: 1, limit: 12, blur: 0, grayscale: false, search: '' },
  selectedImage: null,
  user: null,
  token: localStorage.getItem('token') || null,
  csrfToken: null,
}

function galleryReducer(state, action) {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }
    case SET_IMAGES:
      return {
        ...state,
        images: action.payload.images || [],
        total: action.payload.total || 0,
      }
    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
      }
    case SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      }
    case SELECT_IMAGE:
      return {
        ...state,
        selectedImage: action.payload,
      }
    case CLEAR_SELECTION:
      return {
        ...state,
        selectedImage: null,
      }
    case NEXT_PAGE:
      return {
        ...state,
        filters: {
          ...state.filters,
          page: state.filters.page + 1,
        },
      }
    case PREV_PAGE:
      return {
        ...state,
        filters: {
          ...state.filters,
          page: Math.max(1, state.filters.page - 1),
        },
      }
    case SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        csrfToken: action.payload.csrfToken,
      }
    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        csrfToken: null,
        images: [],
        total: 0,
      }
    default:
      return state
  }
}

const GalleryContext = createContext(null)

export function GalleryProvider({ children }) {
  const [state, dispatch] = useReducer(galleryReducer, initialState)

  const fetchImages = useCallback(async (activeFilters) => {
    const { page, limit, width, height, blur, grayscale, search } = activeFilters
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    dispatch({ type: SET_LOADING, payload: true })
    dispatch({ type: SET_ERROR, payload: null })

    try {
      const url = `${API_URL}/api/pictures?search=${encodeURIComponent(search || '')}&page=${page}&limit=${limit}&width=${width}&height=${height}&blur=${blur}&grayscale=${grayscale}`
      
      const headers = {}
      if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`
      }

      const response = await fetch(url, {
        headers,
        signal: controller.signal
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Não foi possível carregar as imagens no momento.')
      }

      const data = await response.json()
      dispatch({ type: SET_IMAGES, payload: { images: data.images, total: data.total } })
      dispatch({ type: SET_ERROR, payload: null })
    } catch (error) {
      const message =
        error.name === 'AbortError'
          ? 'A requisição demorou demais. Tente novamente em instantes.'
          : error.message || 'Ocorreu um erro ao buscar imagens. Verifique sua conexão e tente novamente.'

      dispatch({ type: SET_IMAGES, payload: { images: [], total: 0 } })
      dispatch({ type: SET_ERROR, payload: message })
    } finally {
      clearTimeout(timeoutId)
      dispatch({ type: SET_LOADING, payload: false })
    }
  }, [state.token])

  const applyFilters = useCallback(
    async (newFilters) => {
      const nextFilters = {
        ...state.filters,
        ...newFilters,
      }

      dispatch({ type: SET_FILTERS, payload: newFilters })
      await fetchImages(nextFilters)
    },
    [fetchImages, state.filters],
  )

  const selectImage = useCallback((image) => {
    dispatch({ type: SELECT_IMAGE, payload: image })
  }, [])

  const clearSelection = useCallback(() => {
    dispatch({ type: CLEAR_SELECTION })
  }, [])

  const goToNextPage = useCallback(async () => {
    const nextFilters = {
      ...state.filters,
      page: state.filters.page + 1,
    }

    dispatch({ type: NEXT_PAGE })
    await fetchImages(nextFilters)
  }, [fetchImages, state.filters])

  const goToPrevPage = useCallback(async () => {
    const previousPage = Math.max(1, state.filters.page - 1)
    const previousFilters = {
      ...state.filters,
      page: previousPage,
    }

    dispatch({ type: PREV_PAGE })
    await fetchImages(previousFilters)
  }, [fetchImages, state.filters])

  const login = useCallback(async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao realizar login.')
      }
      localStorage.setItem('token', data.token)
      dispatch({
        type: SET_USER,
        payload: { user: data.user, token: data.token, csrfToken: data.csrfToken }
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    dispatch({ type: LOGOUT })
  }, [])

  const insertPicture = useCallback(async ({ title, url, width, height }) => {
    try {
      const response = await fetch(`${API_URL}/api/pictures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
          'X-CSRF-Token': state.csrfToken
        },
        body: JSON.stringify({ title, url, width, height })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao inserir imagem.')
      }
      await fetchImages(state.filters)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [state.token, state.csrfToken, state.filters, fetchImages])

  useEffect(() => {
    const checkSession = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          })
          const data = await response.json()
          if (response.ok) {
            dispatch({
              type: SET_USER,
              payload: { user: data.user, token: savedToken, csrfToken: data.csrfToken }
            })
          } else {
            localStorage.removeItem('token')
            dispatch({ type: LOGOUT })
          }
        } catch (err) {
          // ignore
        }
      }
    }
    checkSession()
  }, [])

  useEffect(() => {
    if (state.user) {
      fetchImages(initialState.filters)
    }
  }, [fetchImages, state.user])

  const value = useMemo(
    () => ({
      ...state,
      fetchImages,
      applyFilters,
      selectImage,
      clearSelection,
      goToNextPage,
      goToPrevPage,
      login,
      logout,
      insertPicture,
    }),
    [state, fetchImages, applyFilters, selectImage, clearSelection, goToNextPage, goToPrevPage, login, logout, insertPicture],
  )

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
}

export function useGallery() {
  const context = useContext(GalleryContext)

  if (!context) {
    throw new Error('useGallery deve ser usado dentro de GalleryProvider')
  }

  return context
}
