import { useState, useEffect } from 'react'

type GeoState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'granted'; lat: number; lng: number }
  | { status: 'denied' }
  | { status: 'unavailable' }

export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({ status: 'idle' })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ status: 'unavailable' })
      return
    }

    setState({ status: 'loading' })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: 'granted',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      (err) => {
        // PERMISSION_DENIED = 1
        setState(err.code === 1 ? { status: 'denied' } : { status: 'unavailable' })
      },
      { timeout: 8000, maximumAge: 60_000 },
    )
  }, [])

  return state
}
