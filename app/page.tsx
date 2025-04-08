import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Willkommen</h1>
      <p className="text-lg text-gray-600 mb-8">
        Dies ist meine einfache Next.js Anwendung
      </p>
      <Button variant="outline">Button</Button>
    </div>
  );
}
