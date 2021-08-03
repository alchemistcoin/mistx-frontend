/* eslint-disable @typescript-eslint/camelcase */
// @ts-nocheck

declare global {
  interface Window {
    Intercom: any
    intercomSettings: any
    attachEvent: any
  }
}

const ENV = {
  INTERCOM_APP_ID: 's65xdicu'
}

export function init() {
  if (typeof window === 'undefined')
    return // We pre-filled your app ID in the widget URL: 'https://widget.intercom.io/widget/ssw61yhe'
  ;(function() {
    const w = window
    const ic = w.Intercom
    if (typeof ic === 'function') {
      ic('reattach_activator')
      ic('update', w.intercomSettings)
    } else {
      const d = document
      const i = function(...rest) {
        i.c(rest)
      }
      i.q = []
      i.c = function(args) {
        i.q.push(args)
      }
      w.Intercom = i
      const l = function() {
        const s = d.createElement('script')
        s.type = 'text/javascript'
        s.async = true
        s.src = 'https://widget.intercom.io/widget/' + ENV.INTERCOM_APP_ID
        const x = d.getElementsByTagName('script')[0]
        x.parentNode.insertBefore(s, x)
      }
      if (document.readyState === 'complete') {
        l()
      } else if (w.attachEvent) {
        w.attachEvent('onload', l)
      } else {
        w.addEventListener('load', l, false)
      }
    }
  })()

  console.log('init intercom')
}

export function start() {
  window.Intercom('boot', {
    app_id: ENV.INTERCOM_APP_ID
    // Website visitor so may not have any user related info
  })
}

export function update({
  createdAt,
  email,
  userId
}: {
  createdAt: number | undefined
  email: string | undefined
  userId: string | undefined
}) {
  window.Intercom('update', {
    email,
    user_id: userId,
    created_at: createdAt
  })
}

export function logout() {
  window.Intercom('shutdown')
}

export function hide() {
  window.Intercom('hide')
}

export function show() {
  window.Intercom('show')
}
