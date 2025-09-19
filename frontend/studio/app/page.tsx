import HomePage from "@/app/components/home/home-page"
import LayoutApp from "./components/layout/layout-app"

export default async function Home() {
  return (
    <LayoutApp>
      <HomePage />
    </LayoutApp>
  )
}
