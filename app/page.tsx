import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome to the QA Testcase Practice App</h1>
      <Link href="/testcases">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Start Testcase Assignment</button>
      </Link>
    </main>
  );
}