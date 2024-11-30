import BeepTimer from '../beep-timer'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Woof Timer</h1>
        <BeepTimer />
      </div>
    </main>
  )
}
