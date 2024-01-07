import type { PropsWithChildren } from 'react'
import { Header } from './atoms/Header'
import { Footer } from './atoms/Footer'

export function Layout(props: PropsWithChildren) {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ flexGrow: 1 }}>
          {props.children}
        </div>
        <Footer />
      </div>
    </div>
  )
}
