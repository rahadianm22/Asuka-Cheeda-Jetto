import TopBar from '@/components/TopBar';
import NotFoundCard from '@/components/NotFoundCard';

export const metadata = {
  title: 'Pasien tidak ditemukan · Website Asuka Jetto',
};

export default function NotFound() {
  return (
    <>
      <div className="pawlayer" aria-hidden="true" />
      <TopBar />
      <NotFoundCard />
    </>
  );
}
