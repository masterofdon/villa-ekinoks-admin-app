import { notFound } from 'next/navigation';

// Routes unmatched URLs through the (app) layout so the 404 renders inside the app shell
export default function CatchAllPage() {
  notFound();
}
